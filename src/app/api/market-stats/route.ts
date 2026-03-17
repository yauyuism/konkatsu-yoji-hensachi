import { NextResponse } from "next/server";

import {
  MARKET_AGE_MAX,
  MARKET_AGE_MIN,
  MARKET_EDUCATION_LABELS,
  MARKET_REGION_LABELS,
} from "@/data/market";
import { saveMarketStats, type MarketStatsRequest } from "@/lib/market-stats";
import { checkScopedHourlyRateLimit } from "@/lib/rate-limit";

const MARKET_STATS_HOURLY_LIMIT = 60;

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

function parseRequestBody(value: unknown): MarketStatsRequest {
  if (!isPlainObject(value)) {
    throw new ValidationError("リクエスト形式が正しくありません");
  }

  const gender = value.gender;
  if (gender !== "male" && gender !== "female") {
    throw new ValidationError("性別が不正です");
  }

  const age = parseInteger(value.age, "年齢");
  if (age < MARKET_AGE_MIN || age > MARKET_AGE_MAX) {
    throw new ValidationError("年齢が不正です");
  }

  const income = parseInteger(value.income, "年収");
  if (income < 0 || income > 2000) {
    throw new ValidationError("年収が不正です");
  }

  const height = parseInteger(value.height, "身長");
  if (height < 0 || height > 210) {
    throw new ValidationError("身長が不正です");
  }

  const education = value.education;
  if (typeof education !== "string" || !(education in MARKET_EDUCATION_LABELS)) {
    throw new ValidationError("学歴が不正です");
  }

  const region = value.region;
  if (typeof region !== "string" || !(region in MARKET_REGION_LABELS)) {
    throw new ValidationError("居住エリアが不正です");
  }

  return {
    gender,
    age,
    income,
    height,
    education: education as MarketStatsRequest["education"],
    region: region as MarketStatsRequest["region"],
  };
}

export async function POST(request: Request) {
  const rateLimit = await checkScopedHourlyRateLimit(request, "market-stats", MARKET_STATS_HOURLY_LIMIT);
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
    await saveMarketStats(body);

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

    console.error("Market stats save error:", error);
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
