import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { isSupportedApp, type ReadFilterResult, type SupportedApp } from "@/lib/convert-filter";
import { checkDailyRequestCap, checkHourlyRateLimit } from "@/lib/rate-limit";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;
const MAX_IMAGE_BASE64_LENGTH = 7_000_000;
const MAX_REQUEST_BODY_LENGTH = 8_500_000;
const READ_FILTER_HOURLY_LIMIT = 8;

const SYSTEM_PROMPT = `あなたはマッチングアプリの検索条件設定画面を読み取る専門AIです。
スクリーンショットから検索条件を読み取り、JSONで返してください。
JSON以外は一切出力しないでください。

読み取る項目:
- 年齢の下限と上限
- 年収の下限と上限（設定されていれば。万円単位）
- 身長の下限と上限（設定されていれば。cm単位）
- 学歴（設定されていれば。「大卒」「大学院卒」等）
- 居住エリア（設定されていれば。都道府県名 or 地方名）
- 相手の性別（判別できれば）

重要なルール:
- 読み取れない項目は null にする。推測で埋めないこと
- 画像に含まれる名前・写真・個人情報は一切出力しないこと
- 数値のみを抽出すること
- アプリによって UI が異なるので、表示形式に柔軟に対応すること
- JSON のキー名は必ずこの通りにすること

{
  "targetGender": <"male"|"female"|null>,
  "ageMin": <数値 or null>,
  "ageMax": <数値 or null>,
  "incomeMin": <万円単位の数値 or null>,
  "incomeMax": <万円単位の数値 or null>,
  "heightMin": <cm単位の数値 or null>,
  "heightMax": <cm単位の数値 or null>,
  "education": <文字列 or null>,
  "region": <文字列 or null>,
  "rawConditions": [<読み取ったが上記に分類できなかった条件の文字列>],
  "confidence": <"high"|"medium"|"low">
}`;

let client: Anthropic | null = null;

class ResponseFormatError extends Error {}
class ValidationError extends Error {}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  if (!client) {
    client = new Anthropic({ apiKey });
  }

  return client;
}

function extractTextContent(message: Awaited<ReturnType<Anthropic["messages"]["create"]>>) {
  const blocks = "content" in message ? message.content : [];

  return blocks
    .filter((block): block is Extract<typeof blocks[number], { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function extractJsonText(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new ResponseFormatError("JSON block not found");
  }

  return cleaned.slice(start, end + 1);
}

function normalizeReadResult(input: unknown): ReadFilterResult {
  if (!input || typeof input !== "object") {
    throw new ResponseFormatError("read result is not an object");
  }

  const candidate = input as Record<string, unknown>;
  const confidence = candidate.confidence;

  return {
    targetGender: candidate.targetGender === "female" ? "female" : candidate.targetGender === "male" ? "male" : null,
    ageMin: typeof candidate.ageMin === "number" ? candidate.ageMin : null,
    ageMax: typeof candidate.ageMax === "number" ? candidate.ageMax : null,
    incomeMin: typeof candidate.incomeMin === "number" ? candidate.incomeMin : null,
    incomeMax: typeof candidate.incomeMax === "number" ? candidate.incomeMax : null,
    heightMin: typeof candidate.heightMin === "number" ? candidate.heightMin : null,
    heightMax: typeof candidate.heightMax === "number" ? candidate.heightMax : null,
    education: typeof candidate.education === "string" && candidate.education.trim() ? candidate.education.trim() : null,
    region: typeof candidate.region === "string" && candidate.region.trim() ? candidate.region.trim() : null,
    rawConditions: Array.isArray(candidate.rawConditions)
      ? candidate.rawConditions.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [],
    confidence: confidence === "high" || confidence === "medium" || confidence === "low" ? confidence : "low",
  };
}

function validateBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new ValidationError("リクエスト形式が正しくありません");
  }

  const candidate = body as Record<string, unknown>;
  const image = typeof candidate.image === "string" ? candidate.image.trim() : "";
  const appName = typeof candidate.appName === "string" ? candidate.appName.trim() : "";

  if (!image) {
    throw new ValidationError("画像が必要です");
  }

  if (!isSupportedApp(appName)) {
    throw new ValidationError("アプリ名が不正です");
  }

  if (image.length > MAX_IMAGE_BASE64_LENGTH) {
    throw new ValidationError("画像サイズを小さくしてください");
  }

  return {
    image,
    appName,
  };
}

async function requestFilterRead(input: { image: string; appName: SupportedApp }) {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: input.image,
            },
          },
          {
            type: "text",
            text: `このスクリーンショットはマッチングアプリ「${input.appName}」の検索条件設定画面です。設定されている条件を読み取って JSON で返してください。`,
          },
        ],
      },
    ],
  });

  const text = extractTextContent(message);
  const jsonText = extractJsonText(text);

  return normalizeReadResult(JSON.parse(jsonText));
}

export async function POST(request: Request) {
  try {
    const rateLimit = await checkHourlyRateLimit(request, READ_FILTER_HOURLY_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "読み取り回数が上限に達しました。少し時間をおいて再度お試しください。",
          retryAfterSeconds: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(rateLimit.resetSeconds),
          },
        }
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_LENGTH) {
      return NextResponse.json(
        { error: "画像サイズを小さくしてください" },
        {
          status: 413,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BODY_LENGTH) {
      return NextResponse.json(
        { error: "画像サイズを小さくしてください" },
        {
          status: 413,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const body = JSON.parse(rawBody) as unknown;
    const input = validateBody(body);
    const dailyCap = await checkDailyRequestCap();
    if (!dailyCap.allowed) {
      return NextResponse.json(
        {
          error: "申し訳ありません。本日の読み取り上限に達しました。時間をおいて再度お試しください。",
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const result = await requestFilterRead({
      image: input.image,
      appName: input.appName,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.warn("read-filter validation", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      console.warn("read-filter syntax", error.message);
      return NextResponse.json({ error: "リクエスト形式が正しくありません" }, { status: 400 });
    }

    console.error("read-filter error", error);

    return NextResponse.json(
      { error: "読み取りに失敗しました。手動で入力してください。" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
