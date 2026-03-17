export const EMOJI_REGEX = /\p{Extended_Pictographic}/gu;

export function countEmojis(text: string) {
  return text.match(EMOJI_REGEX)?.length ?? 0;
}

export function standardDeviation(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

export function roundTo1(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundTo2(value: number) {
  return Math.round(value * 100) / 100;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getNgrams(text: string, size: number) {
  const cleaned = text.replace(/[\s\p{Extended_Pictographic}\uFE0F]/gu, "");
  const result: string[] = [];

  for (let index = 0; index <= cleaned.length - size; index += 1) {
    result.push(cleaned.slice(index, index + size));
  }

  return result;
}

export function getOverlapRatio(left: string, right: string) {
  const leftNgrams = new Set(getNgrams(left, 3));
  const rightNgrams = new Set(getNgrams(right, 3));

  if (leftNgrams.size === 0 || rightNgrams.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const value of leftNgrams) {
    if (rightNgrams.has(value)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(leftNgrams.size, rightNgrams.size);
}
