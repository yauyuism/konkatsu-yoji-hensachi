import { AGE_MAX, AGE_MIN, EDUCATIONS, REGIONS, incomeThresholds, type EducationKey } from "@/data/conditions";
import { DEFAULT_CONDITIONS, getHeightOptions, type Conditions } from "@/lib/conditions";

export type InputMethod = "manual" | "screenshot";

export type SupportedApp = "pairs" | "with" | "omiai" | "tapple" | "tinder" | "bumble" | "toukare" | "marrish" | "zexy" | "other";

export type ReadFilterResult = {
  targetGender: "male" | "female" | null;
  ageMin: number | null;
  ageMax: number | null;
  incomeMin: number | null;
  incomeMax: number | null;
  heightMin: number | null;
  heightMax: number | null;
  education: string | null;
  region: string | null;
  rawConditions: string[];
  confidence: "high" | "medium" | "low";
};

export const supportedApps: Array<{ value: SupportedApp; label: string }> = [
  { value: "pairs", label: "Pairs" },
  { value: "with", label: "with" },
  { value: "omiai", label: "Omiai" },
  { value: "tapple", label: "tapple" },
  { value: "tinder", label: "Tinder" },
  { value: "bumble", label: "Bumble" },
  { value: "toukare", label: "東カレ" },
  { value: "marrish", label: "マリッシュ" },
  { value: "zexy", label: "ゼクシィ" },
  { value: "other", label: "その他" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snapToClosest(value: number, thresholds: readonly number[]) {
  return thresholds.reduce((closest, current) => {
    return Math.abs(current - value) < Math.abs(closest - value) ? current : closest;
  }, thresholds[0] ?? value);
}

function normalizeEducation(value: string | null): EducationKey | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes("大学院") || normalized.includes("graduate")) {
    return "graduate";
  }

  if (
    normalized.includes("大卒") ||
    normalized.includes("大学") ||
    normalized.includes("college") ||
    normalized.includes("学士")
  ) {
    return "college";
  }

  if (normalized.includes("高卒") || normalized.includes("高校") || normalized.includes("high school")) {
    return "highschool";
  }

  return "any";
}

function normalizeRegion(value: string | null): Conditions["region"] | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, "");

  if (normalized.includes("全国")) {
    return "all";
  }
  if (normalized.includes("東京")) {
    return "tokyo";
  }
  if (
    normalized.includes("関東") ||
    normalized.includes("神奈川") ||
    normalized.includes("埼玉") ||
    normalized.includes("千葉") ||
    normalized.includes("茨城") ||
    normalized.includes("栃木") ||
    normalized.includes("群馬")
  ) {
    return "kanto";
  }
  if (
    normalized.includes("関西") ||
    normalized.includes("大阪") ||
    normalized.includes("京都") ||
    normalized.includes("兵庫") ||
    normalized.includes("奈良") ||
    normalized.includes("滋賀") ||
    normalized.includes("和歌山")
  ) {
    return "kansai";
  }
  if (
    normalized.includes("東海") ||
    normalized.includes("愛知") ||
    normalized.includes("静岡") ||
    normalized.includes("岐阜") ||
    normalized.includes("三重") ||
    normalized.includes("名古屋")
  ) {
    return "tokai";
  }

  if (normalized.includes("地方") || normalized.includes("その他")) {
    return "other";
  }

  return undefined;
}

function snapHeight(value: number, gender: Conditions["targetGender"]) {
  return snapToClosest(value, getHeightOptions(gender));
}

export function isSupportedApp(value: string): value is SupportedApp {
  return supportedApps.some((app) => app.value === value);
}

export function hasRecognizedConditions(result: ReadFilterResult) {
  return Boolean(
    result.targetGender ||
      result.ageMin !== null ||
      result.ageMax !== null ||
      result.incomeMin !== null ||
      result.incomeMax !== null ||
      result.heightMin !== null ||
      result.heightMax !== null ||
      result.education ||
      result.region
  );
}

export function getInputMethod(value: string | string[] | undefined): InputMethod {
  const input = Array.isArray(value) ? value[0] : value;
  return input === "screenshot" ? "screenshot" : "manual";
}

export function convertFilterResultToConditions(result: ReadFilterResult): Partial<Conditions> {
  const next: Partial<Conditions> = {};
  const targetGender = result.targetGender ?? DEFAULT_CONDITIONS.targetGender;

  if (result.targetGender) {
    next.targetGender = result.targetGender;
  }

  if (result.ageMin !== null) {
    next.ageMin = clamp(result.ageMin, AGE_MIN, AGE_MAX);
  }

  if (result.ageMax !== null) {
    next.ageMax = clamp(result.ageMax, AGE_MIN, AGE_MAX);
  }

  if (next.ageMin !== undefined && next.ageMax !== undefined && next.ageMin > next.ageMax) {
    const smaller = Math.min(next.ageMin, next.ageMax);
    const larger = Math.max(next.ageMin, next.ageMax);
    next.ageMin = smaller;
    next.ageMax = larger;
  }

  if (result.incomeMin !== null) {
    next.incomeMin = snapToClosest(result.incomeMin, incomeThresholds);
  }

  if (result.incomeMax !== null) {
    next.incomeMax = snapToClosest(result.incomeMax, incomeThresholds);
  }

  if (next.incomeMin !== undefined && next.incomeMax !== undefined && next.incomeMin > next.incomeMax) {
    const smaller = Math.min(next.incomeMin, next.incomeMax);
    const larger = Math.max(next.incomeMin, next.incomeMax);
    next.incomeMin = smaller;
    next.incomeMax = larger;
  }

  if (result.heightMin !== null) {
    next.heightMin = snapHeight(result.heightMin, targetGender);
  }

  if (result.heightMax !== null) {
    next.heightMax = snapHeight(result.heightMax, targetGender);
  }

  if (next.heightMin !== undefined && next.heightMax !== undefined && next.heightMin > next.heightMax) {
    const smaller = Math.min(next.heightMin, next.heightMax);
    const larger = Math.max(next.heightMin, next.heightMax);
    next.heightMin = smaller;
    next.heightMax = larger;
  }

  const education = normalizeEducation(result.education);
  if (education && education in EDUCATIONS) {
    next.education = education;
  }

  const region = normalizeRegion(result.region);
  if (region && region in REGIONS) {
    next.region = region;
  }

  return next;
}
