import { NextResponse } from "next/server";

import { hensachiQuestions } from "@/data/hensachi-questions";
import { getHensachiStatsSnapshot, saveHensachiStats, type HensachiStatsRequest } from "@/lib/hensachi-stats";
import { checkScopedHourlyRateLimit } from "@/lib/rate-limit";

const HENSACHI_STATS_HOURLY_LIMIT = 60;

export const dynamic = "force-dynamic";

class ValidationError extends Error {}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAnswerIndexes(value: unknown, expectedLength: number) {
  if (!Array.isArray(value) || value.length !== expectedLength) {
    throw new ValidationError("回答データが不正です");
  }

  return value.map((item, index) => {
    if (typeof item !== "number" || !Number.isInteger(item) || item < 0 || item > 3) {
      throw new ValidationError(`${index + 1}問目の回答が不正です`);
    }

    return item;
  });
}

function parseRequestBody(value: unknown): HensachiStatsRequest {
  if (!isPlainObject(value)) {
    throw new ValidationError("リクエスト形式が正しくありません");
  }

  return {
    answerIndexes: parseAnswerIndexes(value.answerIndexes, hensachiQuestions.length),
  };
}

export async function GET() {
  const stats = await getHensachiStatsSnapshot();

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

export async function POST(request: Request) {
  const rateLimit = await checkScopedHourlyRateLimit(request, "hensachi-stats", HENSACHI_STATS_HOURLY_LIMIT);
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
    await saveHensachiStats(body);

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

    console.error("Hensachi stats save error:", error);
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
