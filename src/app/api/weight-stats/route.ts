import { NextResponse } from "next/server";

import { SITUATION_OPTIONS, WEIGHT_JUDGMENT_META, type Situation, type WeightJudgment } from "@/data/weight";
import { saveWeightStats, type WeightStatsRequest } from "@/lib/weight-stats";
import { checkScopedHourlyRateLimit } from "@/lib/rate-limit";
import type { WeightAnalysisConfidence, WeightBreakdown, WeightInputMode } from "@/lib/weight-types";

const WEIGHT_STATS_HOURLY_LIMIT = 60;

class ValidationError extends Error {}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFiniteNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError(`${label}が不正です`);
  }

  return value;
}

function parseBreakdownItem(value: unknown, label: string) {
  if (!isPlainObject(value)) {
    throw new ValidationError(`${label}が不正です`);
  }

  return {
    value: parseFiniteNumber(value.value, `${label}の値`),
    weight: parseFiniteNumber(value.weight, `${label}の補正値`),
    detail: typeof value.detail === "string" ? value.detail.slice(0, 120) : "",
  };
}

function parseBreakdown(value: unknown): WeightBreakdown {
  if (!isPlainObject(value)) {
    throw new ValidationError("内訳が不正です");
  }

  return {
    baseWeight: parseBreakdownItem(value.baseWeight, "基礎重量"),
    textRatio: parseBreakdownItem(value.textRatio, "文量バランス"),
    questionDensity: parseBreakdownItem(value.questionDensity, "質問密度"),
    emojiGap: parseBreakdownItem(value.emojiGap, "絵文字温度差"),
    topicInitRate: parseBreakdownItem(value.topicInitRate, "話題起点率"),
    lengthVariance: parseBreakdownItem(value.lengthVariance, "メッセージ長の偏差"),
  };
}

function parseRequestBody(body: unknown): WeightStatsRequest {
  if (!isPlainObject(body)) {
    throw new ValidationError("リクエスト形式が正しくありません");
  }

  const gender = body.gender;
  if (gender !== "male" && gender !== "female") {
    throw new ValidationError("性別が不正です");
  }

  const situation = typeof body.situation === "string" ? body.situation : "";
  if (!SITUATION_OPTIONS.some((option) => option.value === situation)) {
    throw new ValidationError("関係性が不正です");
  }

  const inputMode = body.inputMode;
  if (inputMode !== "images" && inputMode !== "text") {
    throw new ValidationError("入力方式が不正です");
  }

  const confidence = body.confidence;
  if (confidence !== "high" && confidence !== "medium" && confidence !== "low") {
    throw new ValidationError("読み取り信頼度が不正です");
  }

  const imageCount = parseFiniteNumber(body.imageCount, "画像枚数");
  if (!Number.isInteger(imageCount) || imageCount < 0 || imageCount > 5) {
    throw new ValidationError("画像枚数が不正です");
  }

  const judgment = typeof body.judgment === "string" ? body.judgment : "";
  if (!(judgment in WEIGHT_JUDGMENT_META)) {
    throw new ValidationError("判定が不正です");
  }

  const messageCount = parseFiniteNumber(body.messageCount, "メッセージ数");
  if (!Number.isInteger(messageCount) || messageCount < 0 || messageCount > 5000) {
    throw new ValidationError("メッセージ数が不正です");
  }

  return {
    gender,
    situation: situation as Situation,
    inputMode: inputMode as WeightInputMode,
    confidence: confidence as WeightAnalysisConfidence,
    imageCount,
    totalWeight: parseFiniteNumber(body.totalWeight, "総重量"),
    partnerWeight: parseFiniteNumber(body.partnerWeight, "相手重量"),
    weightDiff: parseFiniteNumber(body.weightDiff, "重量差"),
    judgment: judgment as WeightJudgment,
    breakdown: parseBreakdown(body.breakdown),
    messageCount,
  };
}

export async function POST(request: Request) {
  const rateLimit = await checkScopedHourlyRateLimit(request, "weight-stats", WEIGHT_STATS_HOURLY_LIMIT);
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

  try {
    const body = parseRequestBody(await request.json());
    await saveWeightStats(body);

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
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

    console.error("Weight stats save error:", error);
    return NextResponse.json(
      { error: "統計の保存に失敗しました" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
