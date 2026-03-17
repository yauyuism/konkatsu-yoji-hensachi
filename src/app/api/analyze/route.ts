import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import {
  buildDetailUserPrompt,
  buildInitialUserPrompt,
  DETAIL_SYSTEM_PROMPT,
  INITIAL_SYSTEM_PROMPT,
} from "@/lib/analyze-prompt";
import { checkDailyRequestCap, checkHourlyRateLimit } from "@/lib/rate-limit";
import {
  badCategoryOptions,
  buildProfAxisComments,
  buildProfileCoachComment,
  buildProfileSummary,
  getProfNickname,
  getProfTitleMeta,
  getWeakestScoreKey,
  goodCategoryOptions,
  isAnalysisResult,
  isBaseAnalysisResult,
  normalizeProfileCoachComment,
  normalizeProfileSummary,
  profAxisLabels,
  safetyRedFlagTerms,
  sanitizeScoreSet,
  type AnalysisResult,
  type AnalyzeRequest,
  type BaseAnalysisResult,
  type DetailAnalysisResult,
  type HighlightCategoryBad,
  type HighlightCategoryGood,
  type HighlightNote,
  type ProfAppValue,
  type ProfGender,
  type TargetAudience,
} from "@/lib/prof";
import { saveAnonymousStats } from "@/lib/stats";

const MODEL = "claude-sonnet-4-20250514";
const MIN_PROFILE_LENGTH = 30;
const MAX_PROFILE_LENGTH = 1500;
const INITIAL_MAX_TOKENS = 1800;
const DETAIL_MAX_TOKENS = 2400;

const allowedApps: ProfAppValue[] = [
  "pairs",
  "with",
  "omiai",
  "tapple",
  "tinder",
  "bumble",
  "toukare",
  "marrish",
  "zexy",
  "other",
];

type AnalyzeMode = "initial" | "details";

type AnalyzeBody = AnalyzeRequest & {
  mode?: AnalyzeMode;
  analysisToken?: string;
  baseResult?: BaseAnalysisResult;
};

class ResponseFormatError extends Error {}
class RefusalError extends Error {}
class ValidationError extends Error {}

let client: Anthropic | null = null;

function buildResponseHeaders(requestId: string, startedAt: number, init?: HeadersInit) {
  const duration = Date.now() - startedAt;
  const headers = new Headers(init);
  headers.set("Cache-Control", headers.get("Cache-Control") ?? "no-store");
  headers.set("X-Analyze-Request-Id", requestId);
  headers.set("Server-Timing", `total;dur=${duration}`);

  return headers;
}

function logAnalyzeEvent(level: "info" | "error", payload: Record<string, unknown>) {
  const body = JSON.stringify({
    scope: "prof_analyze",
    ...payload,
  });

  if (level === "error") {
    console.error(body);
    return;
  }

  console.info(body);
}

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

function getTokenSecret() {
  return process.env.ANALYZE_TOKEN_SECRET ?? process.env.ANTHROPIC_API_KEY ?? "codex-local-dev-secret";
}

function buildInputFingerprint(input: AnalyzeRequest) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        gender: input.gender,
        age: input.age,
        apps: [...input.apps].sort(),
        profileText: input.profileText,
      })
    )
    .digest("base64url");
}

function signAnalysisToken(baseResult: BaseAnalysisResult, input: AnalyzeRequest) {
  const payload = {
    v: 1,
    exp: Date.now() + 1000 * 60 * 10,
    fingerprint: buildInputFingerprint(input),
    baseResult,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getTokenSecret()).update(encoded).digest("base64url");

  return `${encoded}.${signature}`;
}

function verifyAnalysisToken(token: string, input: AnalyzeRequest) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    throw new ValidationError("詳細分析の認証情報が壊れています");
  }

  const expected = createHmac("sha256", getTokenSecret()).update(encoded).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new ValidationError("詳細分析の認証情報が無効です");
  }

  let parsed: {
    exp?: number;
    fingerprint?: string;
    baseResult?: unknown;
  };

  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      exp?: number;
      fingerprint?: string;
      baseResult?: unknown;
    };
  } catch {
    throw new ValidationError("詳細分析の認証情報を読み取れませんでした");
  }

  if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) {
    throw new ValidationError("詳細分析の有効期限が切れています。もう一度診断してください");
  }

  if (parsed.fingerprint !== buildInputFingerprint(input)) {
    throw new ValidationError("詳細分析の認証情報が一致しません");
  }

  if (!isBaseAnalysisResult(parsed.baseResult)) {
    throw new ValidationError("詳細分析の前提データが不足しています");
  }

  return parsed.baseResult;
}

function isAllowedApp(value: string): value is ProfAppValue {
  return allowedApps.includes(value as ProfAppValue);
}

function sanitizeHighlightList(input: unknown, type: "good" | "bad"): HighlightNote[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const normalized: HighlightNote[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Record<string, unknown>;
    const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
    const reason = typeof candidate.reason === "string" ? candidate.reason.trim() : "";
    const suggestion = typeof candidate.suggestion === "string" ? candidate.suggestion.trim() : undefined;

    if (!text || !reason) {
      continue;
    }

    normalized.push({
      text,
      reason,
      suggestion: type === "bad" ? suggestion : undefined,
    });
  }

  return normalized.slice(0, 6);
}

function normalizeCategoryList<T extends string>(input: unknown, allowed: readonly T[]) {
  if (!Array.isArray(input)) {
    return [];
  }

  return [...new Set(input.filter((value): value is T => typeof value === "string" && allowed.includes(value as T)))];
}

function normalizeBaseResult(input: unknown): BaseAnalysisResult {
  if (!input || typeof input !== "object") {
    throw new ResponseFormatError("analysis result is not an object");
  }

  const candidate = input as Record<string, unknown>;
  const scores = sanitizeScoreSet(candidate.scores as Record<string, unknown>);
  const title = getProfTitleMeta(scores.total).title;

  const normalized: BaseAnalysisResult = {
    scores,
    title,
    nickname: "",
    axisComments: buildProfAxisComments(scores),
    summary: "",
    highlights: {
      good: sanitizeHighlightList((candidate.highlights as Record<string, unknown> | undefined)?.good, "good"),
      bad: sanitizeHighlightList((candidate.highlights as Record<string, unknown> | undefined)?.bad, "bad"),
    },
    comment: "",
  };

  normalized.nickname = typeof candidate.nickname === "string" && candidate.nickname.trim()
    ? candidate.nickname.trim()
    : getProfNickname(scores);
  normalized.summary = normalizeProfileSummary(
    typeof candidate.summary === "string" ? candidate.summary : null,
    buildProfileSummary(normalized)
  );
  normalized.comment = normalizeProfileCoachComment(
    typeof candidate.comment === "string" ? candidate.comment : null,
    buildProfileCoachComment(normalized)
  );

  const inputAxisComments = candidate.axisComments as Record<string, unknown> | undefined;
  normalized.axisComments = {
    firstImpression:
      typeof inputAxisComments?.firstImpression === "string" && inputAxisComments.firstImpression.trim()
        ? inputAxisComments.firstImpression.trim()
        : normalized.axisComments.firstImpression,
    specificity:
      typeof inputAxisComments?.specificity === "string" && inputAxisComments.specificity.trim()
        ? inputAxisComments.specificity.trim()
        : normalized.axisComments.specificity,
    sincerity:
      typeof inputAxisComments?.sincerity === "string" && inputAxisComments.sincerity.trim()
        ? inputAxisComments.sincerity.trim()
        : normalized.axisComments.sincerity,
    hookability:
      typeof inputAxisComments?.hookability === "string" && inputAxisComments.hookability.trim()
        ? inputAxisComments.hookability.trim()
        : normalized.axisComments.hookability,
    safety:
      typeof inputAxisComments?.safety === "string" && inputAxisComments.safety.trim()
        ? inputAxisComments.safety.trim()
        : normalized.axisComments.safety,
  };

  if (!isBaseAnalysisResult(normalized)) {
    throw new ResponseFormatError("normalized base result is invalid");
  }

  return normalized;
}

function sanitizeTargetAudience(input: unknown): TargetAudience {
  const targetAudience = input as Record<string, unknown> | undefined;

  return {
    main: {
      ageRange: typeof (targetAudience?.main as Record<string, unknown> | undefined)?.ageRange === "string"
        ? ((targetAudience?.main as Record<string, unknown>).ageRange as string).trim()
        : "20代後半",
      occupation: typeof (targetAudience?.main as Record<string, unknown> | undefined)?.occupation === "string"
        ? ((targetAudience?.main as Record<string, unknown>).occupation as string).trim()
        : "事務・営業系",
      persona: typeof (targetAudience?.main as Record<string, unknown> | undefined)?.persona === "string"
        ? ((targetAudience?.main as Record<string, unknown>).persona as string).trim()
        : "27歳、オフィス勤務3年目",
      appHistory: typeof (targetAudience?.main as Record<string, unknown> | undefined)?.appHistory === "string"
        ? ((targetAudience?.main as Record<string, unknown>).appHistory as string).trim()
        : "アプリは2個目で、真面目に会える人を探している",
      personality: typeof (targetAudience?.main as Record<string, unknown> | undefined)?.personality === "string"
        ? ((targetAudience?.main as Record<string, unknown>).personality as string).trim()
        : "穏やかで安心できる人を探している",
      reason: typeof (targetAudience?.main as Record<string, unknown> | undefined)?.reason === "string"
        ? ((targetAudience?.main as Record<string, unknown>).reason as string).trim()
        : "やわらかい温度感が伝わりやすい。",
    },
    sub: {
      ageRange: typeof (targetAudience?.sub as Record<string, unknown> | undefined)?.ageRange === "string"
        ? ((targetAudience?.sub as Record<string, unknown>).ageRange as string).trim()
        : "30代前半",
      occupation: typeof (targetAudience?.sub as Record<string, unknown> | undefined)?.occupation === "string"
        ? ((targetAudience?.sub as Record<string, unknown>).occupation as string).trim()
        : "専門職・クリエイター系",
      persona: typeof (targetAudience?.sub as Record<string, unknown> | undefined)?.persona === "string"
        ? ((targetAudience?.sub as Record<string, unknown>).persona as string).trim()
        : "31歳、専門職で働く一人暮らし",
      appHistory: typeof (targetAudience?.sub as Record<string, unknown> | undefined)?.appHistory === "string"
        ? ((targetAudience?.sub as Record<string, unknown>).appHistory as string).trim()
        : "アプリ疲れしつつも、趣味の合う相手なら反応する",
      personality: typeof (targetAudience?.sub as Record<string, unknown> | undefined)?.personality === "string"
        ? ((targetAudience?.sub as Record<string, unknown>).personality as string).trim()
        : "共通の趣味を重視するタイプ",
      reason: typeof (targetAudience?.sub as Record<string, unknown> | undefined)?.reason === "string"
        ? ((targetAudience?.sub as Record<string, unknown>).reason as string).trim()
        : "会話のきっかけが見えると反応しやすい。",
    },
    miss: {
      type: typeof (targetAudience?.miss as Record<string, unknown> | undefined)?.type === "string"
        ? ((targetAudience?.miss as Record<string, unknown>).type as string).trim()
        : "ハイスペ志向 / 外見重視タイプ",
      reason: typeof (targetAudience?.miss as Record<string, unknown> | undefined)?.reason === "string"
        ? ((targetAudience?.miss as Record<string, unknown>).reason as string).trim()
        : "プロフ文より先に別の指標で判断されやすい。",
      improvementHint: typeof (targetAudience?.miss as Record<string, unknown> | undefined)?.improvementHint === "string"
        ? ((targetAudience?.miss as Record<string, unknown>).improvementHint as string).trim()
        : "冒頭を具体化すると届く確率は少し上がる。",
    },
  };
}

function buildDetailRetryReason(baseResult: BaseAnalysisResult, detail: DetailAnalysisResult) {
  const weakestAxis = getWeakestScoreKey(baseResult.scores);
  const weakestLabel = profAxisLabels[weakestAxis];
  const before = baseResult.scores.total;
  const after = detail.improvedProfile.estimatedScores.total;

  if (after < before + 8) {
    return `改善幅が弱いです。改善後の偏差値を最低でも +8 以上にしてください。現在は +${after - before} です。`;
  }

  if (detail.improvedProfile.estimatedScores[weakestAxis] < baseResult.scores[weakestAxis] + 8) {
    return `${weakestLabel}が十分に改善されていません。最も低い軸を最優先で立て直してください。`;
  }

  if (
    weakestAxis === "safety" &&
    safetyRedFlagTerms.some((term) => detail.improvedProfile.text.includes(term))
  ) {
    return "地雷回避が最弱なのに、防御的表現やNG条件が改善後プロフに残っています。そうした表現を外して書き直してください。";
  }

  return null;
}

function normalizeDetailResult(input: unknown): DetailAnalysisResult {
  if (!input || typeof input !== "object") {
    throw new ResponseFormatError("detail result is not an object");
  }

  const candidate = input as Record<string, unknown>;
  const improved = candidate.improvedProfile as Record<string, unknown> | undefined;

  return {
    targetAudience: sanitizeTargetAudience(candidate.targetAudience),
    improvedProfile: {
      text: typeof improved?.text === "string" ? improved.text.trim() : "",
      estimatedScores: sanitizeScoreSet((improved?.estimatedScores ?? {}) as Record<string, unknown>),
      changes: Array.isArray(improved?.changes)
        ? improved.changes.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 5)
        : [],
    },
    statsCategories: {
      badCategories: normalizeCategoryList(candidate.statsCategories && (candidate.statsCategories as Record<string, unknown>).badCategories, badCategoryOptions) as HighlightCategoryBad[],
      goodCategories: normalizeCategoryList(candidate.statsCategories && (candidate.statsCategories as Record<string, unknown>).goodCategories, goodCategoryOptions) as HighlightCategoryGood[],
    },
  };
}

function extractJsonText(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    if (cleaned.includes("分析できない") || cleaned.includes("お手伝いできません")) {
      throw new RefusalError("分析できない内容が含まれています");
    }

    throw new ResponseFormatError("JSON block not found");
  }

  return cleaned.slice(start, end + 1);
}

function extractTextContent(message: Awaited<ReturnType<Anthropic["messages"]["create"]>>) {
  const blocks = "content" in message ? message.content : [];

  return blocks
    .filter((block): block is Extract<typeof blocks[number], { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function parseMode(mode: unknown): AnalyzeMode {
  return mode === "details" ? "details" : "initial";
}

function validateRequestBody(body: unknown): AnalyzeBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("リクエスト形式が正しくありません");
  }

  const candidate = body as Record<string, unknown>;
  const gender = candidate.gender;
  const age = Number(candidate.age);
  const apps = Array.isArray(candidate.apps)
    ? candidate.apps.filter((value): value is ProfAppValue => typeof value === "string" && isAllowedApp(value))
    : [];
  const profileText = typeof candidate.profileText === "string" ? candidate.profileText.trim() : "";
  const mode = parseMode(candidate.mode);
  const analysisToken = typeof candidate.analysisToken === "string" ? candidate.analysisToken : undefined;

  if (gender !== "male" && gender !== "female") {
    throw new ValidationError("性別を選択してください");
  }
  if (!Number.isInteger(age) || age < 18 || age > 60) {
    throw new ValidationError("年齢は18歳から60歳の範囲で入力してください");
  }
  if (profileText.length < MIN_PROFILE_LENGTH) {
    throw new ValidationError("もう少し長いプロフ文を貼り付けてください（30文字以上）");
  }
  if (profileText.length > MAX_PROFILE_LENGTH) {
    throw new ValidationError("1500文字以内にしてください");
  }
  if (mode === "details" && !analysisToken) {
    throw new ValidationError("詳細分析の認証情報が不足しています");
  }

  return {
    mode,
    gender: gender as ProfGender,
    age,
    apps,
    profileText,
    analysisToken,
  };
}

async function requestBaseAnalysis(input: AnalyzeRequest) {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: INITIAL_MAX_TOKENS,
    system: INITIAL_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildInitialUserPrompt(input),
      },
    ],
  });

  const text = extractTextContent(message);
  const jsonText = extractJsonText(text);

  return normalizeBaseResult(JSON.parse(jsonText));
}

async function requestDetailAnalysis(
  input: AnalyzeRequest,
  baseResult: BaseAnalysisResult,
  retryReason?: string
) {
  const weakestAxis = getWeakestScoreKey(baseResult.scores);
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: DETAIL_MAX_TOKENS,
    system: DETAIL_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildDetailUserPrompt(input, baseResult, {
          weakestAxis,
          minimumImprovement: 8,
          retryReason,
        }),
      },
    ],
  });

  const text = extractTextContent(message);
  const jsonText = extractJsonText(text);

  return normalizeDetailResult(JSON.parse(jsonText));
}

async function withRetry<T>(requestFn: () => Promise<T>) {
  try {
    return await requestFn();
  } catch (error) {
    if (error instanceof ResponseFormatError || error instanceof SyntaxError) {
      return requestFn();
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = randomUUID();

  try {
    const body = await request.json();
    const input = validateRequestBody(body);

    if (input.mode === "initial") {
      const rateLimit = await checkHourlyRateLimit(request);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: "たくさん使っていただきありがとうございます。1時間後にまたどうぞ",
            retryAfterSeconds: rateLimit.resetSeconds,
          },
          {
            status: 429,
            headers: buildResponseHeaders(requestId, startedAt, {
              "Retry-After": String(rateLimit.resetSeconds),
            }),
          }
        );
      }

      const dailyCap = await checkDailyRequestCap();
      if (!dailyCap.allowed) {
        return NextResponse.json(
          {
            error: "申し訳ありません。本日の診断上限に達しました。時間をおいて再度お試しください。",
          },
          {
            status: 503,
            headers: buildResponseHeaders(requestId, startedAt),
          }
        );
      }

      const result = await withRetry(() => requestBaseAnalysis(input));
      logAnalyzeEvent("info", {
        requestId,
        mode: input.mode,
        durationMs: Date.now() - startedAt,
        profileLength: input.profileText.length,
        appsCount: input.apps.length,
        total: result.scores.total,
      });
      return NextResponse.json(
        {
          ...result,
          analysisToken: signAnalysisToken(result, input),
        },
        {
          headers: buildResponseHeaders(requestId, startedAt),
        }
      );
    }

    const baseResult = verifyAnalysisToken(input.analysisToken!, input);
    const details = await withRetry(async () => {
      const first = await requestDetailAnalysis(input, baseResult);
      const retryReason = buildDetailRetryReason(baseResult, first);
      if (!retryReason) {
        return first;
      }

      return requestDetailAnalysis(input, baseResult, retryReason);
    });
    const fullResult: AnalysisResult = {
      ...baseResult,
      ...details,
    };

    if (!isAnalysisResult(fullResult)) {
      throw new ResponseFormatError("merged full result is invalid");
    }

    void saveAnonymousStats(input, fullResult);
    logAnalyzeEvent("info", {
      requestId,
      mode: input.mode,
      durationMs: Date.now() - startedAt,
      profileLength: input.profileText.length,
      appsCount: input.apps.length,
      total: baseResult.scores.total,
      improvedTotal: details.improvedProfile.estimatedScores.total,
      scoreDiff: details.improvedProfile.estimatedScores.total - baseResult.scores.total,
    });

    return NextResponse.json(details, {
        headers: buildResponseHeaders(requestId, startedAt),
    });
  } catch (error) {
    logAnalyzeEvent("error", {
      requestId,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "unknown_error",
      name: error instanceof Error ? error.name : "UnknownError",
    });

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: buildResponseHeaders(requestId, startedAt) });
    }

    if (error instanceof RefusalError) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: buildResponseHeaders(requestId, startedAt) });
    }

    if (error instanceof SyntaxError || error instanceof ResponseFormatError) {
      console.error("Failed to parse Claude response", error);
      return NextResponse.json(
        { error: "分析に失敗しました。もう一度お試しください。" },
        { status: 500, headers: buildResponseHeaders(requestId, startedAt) }
      );
    }

    console.error("Analysis error", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "サーバー設定が未完了です。環境変数を確認してください。" },
        { status: 503, headers: buildResponseHeaders(requestId, startedAt) }
      );
    }

    return NextResponse.json(
      { error: "申し訳ありません。サーバーが混み合っています" },
      { status: 500, headers: buildResponseHeaders(requestId, startedAt) }
    );
  }
}
