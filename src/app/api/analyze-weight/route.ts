import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import {
  buildConversationSummary,
  normalizeAnalyzedMessages,
  normalizeTopicShifts,
  parseConversationByMarkers,
  sanitizeAiExample,
  sanitizeAiComment,
  sanitizeAiParagraph,
} from "@/lib/message-parser";
import { checkDailyRequestCap, checkScopedHourlyRateLimit } from "@/lib/rate-limit";
import { getOverlapRatio } from "@/lib/text-analysis";
import type {
  AnalyzeWeightRequest,
  AnalyzeWeightResponse,
  WeightAnalysisConfidence,
  WeightGender,
  WeightInputMode,
} from "@/lib/weight-types";

const MODEL = "claude-sonnet-4-20250514";
const MAX_INPUT_LENGTH = 10000;
const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ANALYZE_WEIGHT_LIMIT = 10;

class ResponseFormatError extends Error {}
class ValidationError extends Error {}

let client: Anthropic | null = null;

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

function buildTextSystemPrompt() {
  return `あなたはLINEメッセージの構造を分析する専門AIです。
以下の会話テキストから、客観的な構造データを抽出してJSONで返してください。
JSON以外は一切出力しないでください。

返すJSONの形式:
{
  "messages": [
    {
      "sender": "me" | "them",
      "text": "メッセージ本文",
      "timestamp": "14:32" | null,
      "hasSticker": false,
      "contentType": "text" | "sticker" | "image"
    }
  ],
  "topicShifts": [
    {
      "messageIndex": 3,
      "sender": "me" | "them"
    }
  ],
  "comment": "会話の構造的特徴を50文字以内で",
  "explanation": "原因を150-250文字の文章で",
  "improvement": "改善提案を150-250文字の文章で",
  "example": {
    "before": "今の送り方の例文",
    "after": "改善後の例文",
    "reason": "なぜ改善するかの一行"
  }
}

ルール:
- messages は時系列順
- sender は必ず "me" か "them"
- text には本文だけを入れ、名前や日時を含めない
- 主観的な良し悪しを言わない
- 個人名、地名、電話番号などは comment に出さない
- 重い/軽いなどの評価語を comment に入れない
- topicShifts は話題が切り替わった位置だけ返す
- sender が判断しづらい場合でも、会話全体から最も自然な分け方を推定する
- explanation は箇条書きにせず、原因を日常語で説明する
- explanation では「質問密度」「絵文字温度差」などの項目名をそのまま使わない
- explanation では数字や回数をできるだけ具体的に入れる
- improvement は箇条書きにせず、一番効く改善をひとつに絞って提案する
- improvement では抽象的な助言を避け、次の返信でできる行動を書く
- example.before / after は原文をそのまま使わず、会話の雰囲気だけを再現する
- example.reason は20-40文字程度で、なぜ改善になるかを一行で説明する`;
}

function buildScreenshotSystemPrompt() {
  return `あなたはLINEのトーク画面スクリーンショットを読み取る専門AIです。
画像からメッセージを抽出し、JSONで返してください。
JSON以外は一切出力しないでください。

読み取りルール:
- 右側の吹き出し = ユーザー本人のメッセージ（"me"）
- 左側の吹き出し = 相手のメッセージ（"them"）
- 名前、アイコン、プロフィール画像、既読表示、日付区切り線は出力しない
- スタンプのみのメッセージは text を "[スタンプ]"、contentType を "sticker" にする
- 画像のみのメッセージは text を "[画像]"、contentType を "image" にする
- 時系列順で messages を返す
- 画像間で同じメッセージが重複したら1件にまとめる
- 主観的な評価はしない
- comment では会話の構造だけを50文字以内で述べる

返すJSONの形式:
{
  "messages": [
    {
      "sender": "me" | "them",
      "text": "こんにちは",
      "timestamp": "14:32" | null,
      "hasSticker": false,
      "contentType": "text" | "sticker" | "image"
    }
  ],
  "topicShifts": [
    {
      "messageIndex": 3,
      "sender": "me" | "them"
    }
  ],
  "comment": "会話の構造的特徴を50文字以内で",
  "explanation": "原因を150-250文字の文章で",
  "improvement": "改善提案を150-250文字の文章で",
  "example": {
    "before": "今の送り方の例文",
    "after": "改善後の例文",
    "reason": "なぜ改善するかの一行"
  },
  "confidence": "high" | "medium" | "low"
}

ルール:
- explanation は箇条書きにせず、原因を日常語で説明する
- explanation では「質問密度」「絵文字温度差」などの項目名をそのまま使わない
- explanation では数字や回数をできるだけ具体的に入れる
- improvement は箇条書きにせず、一番効く改善をひとつに絞って提案する
- improvement では抽象的な助言を避け、次の返信でできる行動を書く
- example.before / after は原文をそのまま使わず、会話の雰囲気だけを再現する
- example.reason は20-40文字程度で、なぜ改善になるかを一行で説明する`;
}

function buildTextUserPrompt(text: string, gender: WeightGender) {
  return `以下は${gender === "male" ? "男性" : "女性"}ユーザーが貼り付けたメッセージのやりとりです。
「自分」と「相手」のメッセージを区別して分析してください。

=== 会話テキスト ===
${text}
=== 会話テキスト終わり ===`;
}

function parseConfidence(value: unknown, fallback: WeightAnalysisConfidence) {
  return value === "high" || value === "medium" || value === "low" ? value : fallback;
}

function buildFallbackTopicShifts(messages: AnalyzeWeightResponse["messages"]) {
  const shifts: AnalyzeWeightResponse["topicShifts"] = [];

  for (let index = 1; index < messages.length; index += 1) {
    const previous = messages[index - 1];
    const current = messages[index];

    if (getOverlapRatio(previous.text, current.text) < 0.15) {
      shifts.push({
        messageIndex: current.index,
        sender: current.sender,
      });
    }
  }

  return shifts;
}

function buildFallbackComment(summary: AnalyzeWeightResponse["conversationSummary"]) {
  const phrases: string[] = [];

  if (summary.myTotalChars > summary.theirTotalChars * 1.3) {
    phrases.push("自分の文量が相手より多い。");
  }
  if (summary.myQuestionMessages > summary.theirQuestionMessages + 1) {
    phrases.push("質問を自分側が多く出している。");
  }
  if (summary.myTopicShiftCount > summary.theirTopicShiftCount + 1) {
    phrases.push("新しい話題を自分が起こしがち。");
  }

  if (phrases.length === 0) {
    phrases.push("文量と話題のバランスは大きく崩れていない。");
  }

  return phrases.join(" ").slice(0, 80);
}

function buildFallbackExplanation(summary: AnalyzeWeightResponse["conversationSummary"]) {
  const fragments: string[] = [];

  if (summary.myQuestionMessages >= Math.max(2, summary.theirQuestionMessages + 1) && summary.myMessageCount > 0) {
    fragments.push(`質問が入っているのは自分の${summary.myQuestionMessages}通で、聞く比重が高めです。`);
  }
  if (summary.myEmojiCount > summary.theirEmojiCount + 2 && summary.myMessageCount > 0) {
    const gap = ((summary.myEmojiCount - summary.theirEmojiCount) / Math.max(1, summary.myMessageCount)).toFixed(1);
    fragments.push(`絵文字も1通あたり${gap}個ほど相手より多く、テンション差が見えやすくなっています。`);
  }
  if (summary.myTotalChars > summary.theirTotalChars * 1.3 && summary.theirTotalChars > 0) {
    fragments.push(`文量は相手よりかなり多く、情報量の差がそのまま重さになっています。`);
  }
  if (summary.myTopicShiftCount > summary.theirTopicShiftCount + 1) {
    fragments.push(`新しい話題を自分から足す回数も多く、会話を引っ張り続けている印象です。`);
  }

  if (fragments.length === 0) {
    fragments.push("文量や質問のバランスは大きく崩れておらず、会話の温度差も強くは出ていません。全体としては自然なやり取りに見えやすい状態です。");
  }

  return fragments.join("").slice(0, 250);
}

function buildFallbackImprovement(summary: AnalyzeWeightResponse["conversationSummary"]) {
  if (summary.myQuestionMessages >= Math.max(2, summary.theirQuestionMessages + 1)) {
    return "質問を続けるより、1回ごとに自分の情報をひとつ挟んでみてください。聞く→話すの順番に変えるだけで、面接のような圧が薄れて会話の流れが自然になります。".slice(0, 250);
  }
  if (summary.myTotalChars > summary.theirTotalChars * 1.3 && summary.theirTotalChars > 0) {
    return "相手の文量を超えないくらいで止めて、1通を2文前後に収めてみてください。情報を足すより、返しやすい余白を残したほうが重さはぐっと下がります。".slice(0, 250);
  }
  if (summary.myEmojiCount > summary.theirEmojiCount + 2) {
    return "絵文字は相手と同じ数か、ひとつ少ないくらいに揃えてみてください。内容を変えなくても温度差だけで印象がかなり落ち着きます。".slice(0, 250);
  }
  if (summary.myTopicShiftCount > summary.theirTopicShiftCount + 1) {
    return "新しい話題を足す前に、相手が返してくれた内容をもう1ターンだけ広げてみてください。追い立てる感じが薄れて、返答の負担も軽くなります。".slice(0, 250);
  }

  return "今のやり取りは大きく崩れていないので、急に質問量や文量だけを増やしすぎないようにしてみてください。自然なペースを保つことがいちばん効きます。".slice(0, 250);
}

function buildFallbackExample(summary: AnalyzeWeightResponse["conversationSummary"]) {
  if (summary.myQuestionMessages >= Math.max(2, summary.theirQuestionMessages + 1)) {
    return {
      before: "何のお仕事されてるんですか？😊",
      after: "自分はWeb系の仕事してるんですけど、〇〇さんはどんなお仕事ですか？",
      reason: "質問の前に自分の話を入れると面接感が消える。",
    };
  }

  if (summary.myTotalChars > summary.theirTotalChars * 1.3 && summary.theirTotalChars > 0) {
    return {
      before: "今日は仕事がバタバタで、そのあと友達とも会ってかなり疲れました笑",
      after: "今日は仕事が立て込んでました。今やっと落ち着いたところです。",
      reason: "1通を短くすると返しやすい余白が残る。",
    };
  }

  return {
    before: "そうなんだ",
    after: "そうなんだ！自分も最近それ気になってました",
    reason: "短い相づちに一言足すだけで会話が続く。",
  };
}

function normalizeResponse(
  input: unknown,
  options: {
    inputMode: WeightInputMode;
    confidenceFallback: WeightAnalysisConfidence;
    imageCount: number;
  }
): AnalyzeWeightResponse {
  if (!input || typeof input !== "object") {
    throw new ResponseFormatError("analysis result is not an object");
  }

  const candidate = input as Record<string, unknown>;
  const messages = normalizeAnalyzedMessages(candidate.messages);

  if (messages.length < 2) {
    throw new ResponseFormatError("messages are too short");
  }

  const hasMe = messages.some((message) => message.sender === "me");
  const hasThem = messages.some((message) => message.sender === "them");
  if (!hasMe || !hasThem) {
    throw new ResponseFormatError("speaker split is invalid");
  }

  const modelTopicShifts = normalizeTopicShifts(candidate.topicShifts, messages);
  const topicShifts = modelTopicShifts.length > 0 ? modelTopicShifts : buildFallbackTopicShifts(messages);
  const conversationSummary = buildConversationSummary(messages, topicShifts);

  return {
    messages,
    topicShifts,
    conversationSummary,
    comment: sanitizeAiComment(candidate.comment) || buildFallbackComment(conversationSummary),
    explanation: sanitizeAiParagraph(candidate.explanation, 260) || buildFallbackExplanation(conversationSummary),
    improvement: sanitizeAiParagraph(candidate.improvement, 260) || buildFallbackImprovement(conversationSummary),
    example: sanitizeAiExample(candidate.example) ?? buildFallbackExample(conversationSummary),
    parser: "anthropic",
    inputMode: options.inputMode,
    confidence: parseConfidence(candidate.confidence, options.confidenceFallback),
    imageCount: options.imageCount,
  };
}

async function requestTextAnalysis(input: AnalyzeWeightRequest & { inputMode: "text"; text: string }) {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 3200,
    temperature: 0,
    system: buildTextSystemPrompt(),
    messages: [
      {
        role: "user",
        content: buildTextUserPrompt(input.text, input.gender),
      },
    ],
  });

  return normalizeResponse(JSON.parse(extractJsonText(extractTextContent(response))), {
    inputMode: "text",
    confidenceFallback: "high",
    imageCount: 0,
  });
}

function resolveImageMediaType(file: File): Anthropic.Messages.Base64ImageSource["media_type"] {
  if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/gif") {
    return file.type;
  }

  throw new ValidationError("PNG / JPEG / WEBP / GIF の画像を使ってください");
}

async function requestImageAnalysis(input: AnalyzeWeightRequest & { inputMode: "images"; images: File[] }) {
  const imageContents: Anthropic.Messages.ImageBlockParam[] = await Promise.all(
    input.images.map(async (file) => {
      const buffer = await file.arrayBuffer();

      return {
        type: "image",
        source: {
          type: "base64",
          media_type: resolveImageMediaType(file),
          data: Buffer.from(buffer).toString("base64"),
        },
      };
    })
  );

  const content: Anthropic.Messages.ContentBlockParam[] = [
    ...imageContents,
    {
      type: "text",
      text: `上記の${input.images.length}枚のLINEスクリーンショットからメッセージを抽出してください。名前やアイコンは出さず、メッセージの構造だけをJSONで返してください。`,
    },
  ];

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 5200,
    temperature: 0,
    system: buildScreenshotSystemPrompt(),
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });

  return normalizeResponse(JSON.parse(extractJsonText(extractTextContent(response))), {
    inputMode: "images",
    confidenceFallback: "medium",
    imageCount: input.images.length,
  });
}

function fallbackAnalyzeText(input: AnalyzeWeightRequest & { inputMode: "text"; text: string }): AnalyzeWeightResponse | null {
  const messages = parseConversationByMarkers(input.text);
  if (!messages) {
    return null;
  }

  const topicShifts = buildFallbackTopicShifts(messages);
  const conversationSummary = buildConversationSummary(messages, topicShifts);

  return {
    messages,
    topicShifts,
    conversationSummary,
    comment: buildFallbackComment(conversationSummary),
    explanation: buildFallbackExplanation(conversationSummary),
    improvement: buildFallbackImprovement(conversationSummary),
    example: buildFallbackExample(conversationSummary),
    parser: "fallback",
    inputMode: "text",
    confidence: "medium",
    imageCount: 0,
  };
}

function validateTextInput(gender: unknown, text: string): AnalyzeWeightRequest & { inputMode: "text"; text: string } {
  if (gender !== "male" && gender !== "female") {
    throw new ValidationError("性別を選択してください");
  }
  if (text.length < 20) {
    throw new ValidationError("もう少し長い会話を貼ってください");
  }
  if (text.length > MAX_INPUT_LENGTH) {
    throw new ValidationError("テキストは10000文字以内にしてください");
  }

  return {
    gender,
    inputMode: "text" as const,
    text,
  };
}

function validateImageInput(gender: unknown, images: File[]): AnalyzeWeightRequest & { inputMode: "images"; images: File[] } {
  if (gender !== "male" && gender !== "female") {
    throw new ValidationError("性別を選択してください");
  }
  if (images.length === 0) {
    throw new ValidationError("スクショを1枚以上追加してください");
  }
  if (images.length > MAX_IMAGE_COUNT) {
    throw new ValidationError("スクショは最大5枚までです");
  }

  for (const file of images) {
    if (!(file instanceof File)) {
      throw new ValidationError("画像の形式が正しくありません");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new ValidationError("画像は1枚5MB以下にしてください");
    }
    resolveImageMediaType(file);
  }

  return {
    gender,
    inputMode: "images" as const,
    images,
  };
}

async function parseRequestInput(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    const text = typeof body.text === "string" ? body.text.trim() : "";
    return validateTextInput(body.gender, text);
  }

  const formData = await request.formData();
  const gender = formData.get("gender");
  const inputModeValue = formData.get("inputMode");
  const text = typeof formData.get("text") === "string" ? String(formData.get("text")).trim() : "";
  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const inputMode: WeightInputMode = inputModeValue === "images" || (images.length > 0 && !text) ? "images" : "text";

  if (inputMode === "images") {
    return validateImageInput(gender, images);
  }

  return validateTextInput(gender, text);
}

export async function POST(request: Request) {
  const rateLimit = await checkScopedHourlyRateLimit(request, "analyze-weight", ANALYZE_WEIGHT_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "送信回数が多すぎます。しばらくしてからお試しください。" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetSeconds),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const dailyCap = await checkDailyRequestCap();
  if (!dailyCap.allowed) {
    return NextResponse.json(
      { error: "本日の分析回数が上限に達しました。時間をおいてお試しください。" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const input = await parseRequestInput(request);

    if (input.inputMode === "images") {
      const result = await requestImageAnalysis(input);
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const fallbackResult = fallbackAnalyzeText(input);

    try {
      const result = await requestTextAnalysis(input);
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      if (fallbackResult) {
        return NextResponse.json(fallbackResult, {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      }

      console.error("Analyze weight text error:", error);
      throw new Error("分析に失敗しました。`自分:` `相手:` を付けて貼ると安定します。");
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエスト形式が正しくありません" },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.error("Analyze weight error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分析に失敗しました" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
