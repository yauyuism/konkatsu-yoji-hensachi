import { NextResponse } from "next/server";

import { SPEC_CATEGORY_ORDER, SPEC_OPTIONS_BY_ID, type SpecCategory } from "@/data/spec-options";
import { checkScopedHourlyRateLimit } from "@/lib/rate-limit";
import {
  CUSTOM_SPEC_MAX_LENGTH,
  getSelectedCount,
  sanitizeCustomInputs,
  sanitizeSelectedSpecIds,
  type CustomSpecInput,
} from "@/lib/my9specs";
import { saveMy9SpecsStats, type My9SpecsStatsRequest } from "@/lib/my9specs-stats";

const MY9SPECS_STATS_HOURLY_LIMIT = 60;

class ValidationError extends Error {}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSpecCategory(value: unknown): value is SpecCategory {
  return typeof value === "string" && SPEC_CATEGORY_ORDER.includes(value as SpecCategory);
}

function normalizeCustomText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function parsePresetIds(value: unknown) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new ValidationError("プリセット条件の形式が不正です");
  }

  if (new Set(value).size !== value.length) {
    throw new ValidationError("同じプリセット条件が重複しています");
  }

  if (!value.every((item) => SPEC_OPTIONS_BY_ID.has(item))) {
    throw new ValidationError("存在しないプリセット条件が含まれています");
  }

  const sanitized = sanitizeSelectedSpecIds(value);
  if (sanitized.length !== value.length) {
    throw new ValidationError("排他的な条件の組み合わせが含まれています");
  }

  return sanitized;
}

function parseCustomInputs(value: unknown): CustomSpecInput[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("自由入力条件の形式が不正です");
  }

  const parsed = value.map((item, index) => {
    if (!isPlainObject(item)) {
      throw new ValidationError(`自由入力条件 ${index + 1} の形式が不正です`);
    }

    if (!isSpecCategory(item.category)) {
      throw new ValidationError(`自由入力条件 ${index + 1} のカテゴリが不正です`);
    }

    if (typeof item.text !== "string") {
      throw new ValidationError(`自由入力条件 ${index + 1} のテキストが不正です`);
    }

    const text = normalizeCustomText(item.text);
    if (!text) {
      throw new ValidationError(`自由入力条件 ${index + 1} は空欄にできません`);
    }

    if (text.length > CUSTOM_SPEC_MAX_LENGTH) {
      throw new ValidationError(`自由入力条件 ${index + 1} は${CUSTOM_SPEC_MAX_LENGTH}文字以内で入力してください`);
    }

    return {
      id: typeof item.id === "string" ? item.id : `api-custom:${index}`,
      category: item.category,
      text,
    };
  });

  const sanitized = sanitizeCustomInputs(parsed);
  if (sanitized.length !== parsed.length) {
    throw new ValidationError("自由入力条件が重複しています");
  }

  return sanitized;
}

function parseRequestBody(value: unknown): My9SpecsStatsRequest {
  if (!isPlainObject(value)) {
    throw new ValidationError("リクエスト形式が正しくありません");
  }

  const targetGender = value.targetGender;
  if (targetGender !== "male" && targetGender !== "female") {
    throw new ValidationError("対象性別が不正です");
  }

  const presetIds = parsePresetIds(value.presetIds);
  const customInputs = parseCustomInputs(value.customInputs);

  if (getSelectedCount(presetIds, customInputs) !== 9) {
    throw new ValidationError("保存できるのは9条件ちょうどの結果だけです");
  }

  return {
    targetGender,
    presetIds,
    customInputs,
  };
}

export async function POST(request: Request) {
  const rateLimit = await checkScopedHourlyRateLimit(request, "my9specs-stats", MY9SPECS_STATS_HOURLY_LIMIT);
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
    await saveMy9SpecsStats(body);

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

    console.error("My9Specs stats save error:", error);
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
