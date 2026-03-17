import { NextResponse } from "next/server";

import { AGE_MAX, AGE_MIN, EDUCATIONS, REGIONS, incomeThresholds } from "@/data/conditions";
import { saveConditionsStats, type ConditionsStatsRequest } from "@/lib/conditions-stats";
import { isSupportedApp } from "@/lib/convert-filter";
import { getHeightOptions, type Conditions } from "@/lib/conditions";
import { checkScopedHourlyRateLimit } from "@/lib/rate-limit";

const CONDITIONS_STATS_HOURLY_LIMIT = 60;

class ValidationError extends Error {}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseInteger(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new ValidationError(`${label}が不正です`);
  }

  return value;
}

function parseConditions(value: unknown): Conditions {
  if (!isPlainObject(value)) {
    throw new ValidationError("条件の形式が正しくありません");
  }

  const targetGender = value.targetGender;
  if (targetGender !== "male" && targetGender !== "female") {
    throw new ValidationError("対象性別が不正です");
  }

  const ageMin = parseInteger(value.ageMin, "年齢下限");
  const ageMax = parseInteger(value.ageMax, "年齢上限");
  if (ageMin < AGE_MIN || ageMax > AGE_MAX || ageMin > ageMax) {
    throw new ValidationError("年齢条件が不正です");
  }

  const incomeMin = parseInteger(value.incomeMin, "年収条件");
  const incomeMax = parseInteger(value.incomeMax, "年収条件");
  if (
    !incomeThresholds.includes(incomeMin as (typeof incomeThresholds)[number]) ||
    !incomeThresholds.includes(incomeMax as (typeof incomeThresholds)[number])
  ) {
    throw new ValidationError("年収条件が不正です");
  }

  if (incomeMin > 0 && incomeMax > 0 && incomeMin > incomeMax) {
    throw new ValidationError("年収条件が不正です");
  }

  const heightMin = parseInteger(value.heightMin, "身長下限");
  const heightMax = parseInteger(value.heightMax, "身長上限");
  const heightOptions = getHeightOptions(targetGender);

  if (!heightOptions.some((option) => option === heightMin) || !heightOptions.some((option) => option === heightMax)) {
    throw new ValidationError("身長条件が不正です");
  }

  if (heightMin > 0 && heightMax > 0 && heightMin > heightMax) {
    throw new ValidationError("身長条件が不正です");
  }

  const education = value.education;
  if (typeof education !== "string" || !(education in EDUCATIONS)) {
    throw new ValidationError("学歴条件が不正です");
  }

  const region = value.region;
  if (typeof region !== "string" || !(region in REGIONS)) {
    throw new ValidationError("エリア条件が不正です");
  }

  return {
    targetGender,
    ageMin,
    ageMax,
    incomeMin,
    incomeMax,
    heightMin,
    heightMax,
    education: education as Conditions["education"],
    region: region as Conditions["region"],
  };
}

function parseRequestBody(value: unknown): ConditionsStatsRequest {
  if (!isPlainObject(value)) {
    throw new ValidationError("リクエスト形式が正しくありません");
  }

  const inputMethod = value.inputMethod;
  if (inputMethod !== "manual" && inputMethod !== "screenshot") {
    throw new ValidationError("入力方式が不正です");
  }

  const conditions = parseConditions(value.conditions);

  const screenshotApp =
    inputMethod === "screenshot" && typeof value.screenshotApp === "string" && isSupportedApp(value.screenshotApp)
      ? value.screenshotApp
      : null;

  if (inputMethod === "screenshot" && value.screenshotApp !== undefined && value.screenshotApp !== null && !screenshotApp) {
    throw new ValidationError("スクショ元アプリが不正です");
  }

  const screenshotConfidence =
    inputMethod === "screenshot" &&
    (value.screenshotConfidence === "high" || value.screenshotConfidence === "medium" || value.screenshotConfidence === "low")
      ? value.screenshotConfidence
      : null;

  if (
    inputMethod === "screenshot" &&
    value.screenshotConfidence !== undefined &&
    value.screenshotConfidence !== null &&
    !screenshotConfidence
  ) {
    throw new ValidationError("読み取り信頼度が不正です");
  }

  return {
    conditions,
    inputMethod,
    screenshotApp,
    screenshotConfidence,
  };
}

export async function POST(request: Request) {
  const rateLimit = await checkScopedHourlyRateLimit(request, "conditions-stats", CONDITIONS_STATS_HOURLY_LIMIT);
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
    await saveConditionsStats(body);

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

    console.error("Conditions stats save error:", error);
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
