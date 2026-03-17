"use client";

import { getProfTopPercentile } from "@/lib/prof";

type ScoreVariantProps = {
  score: number;
  percentile?: number;
  variant?: "score";
  title?: string | null;
  markerLabel?: string | null;
  caption?: string | null;
  compact?: boolean;
};

type PercentileVariantProps = {
  variant: "percentile";
  percentile: number;
  title?: string | null;
  markerLabel?: string | null;
  caption?: string | null;
  compact?: boolean;
  accentColor?: string;
};

type NormalDistributionChartProps = ScoreVariantProps | PercentileVariantProps;

const tickValues = [30, 40, 50, 60, 70, 80];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Acklam approximation. 分布図のマーカー位置用。
function inverseNormalCDF(probability: number) {
  const p = clamp(probability, 1e-6, 1 - 1e-6);
  const a1 = -39.69683028665376;
  const a2 = 220.9460984245205;
  const a3 = -275.9285104469687;
  const a4 = 138.357751867269;
  const a5 = -30.66479806614716;
  const a6 = 2.506628277459239;
  const b1 = -54.47609879822406;
  const b2 = 161.5858368580409;
  const b3 = -155.6989798598866;
  const b4 = 66.80131188771972;
  const b5 = -13.28068155288572;
  const c1 = -0.007784894002430293;
  const c2 = -0.3223964580411365;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;
  const d1 = 0.007784695709041462;
  const d2 = 0.3224671290700398;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  }

  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
    ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
}

function getScoreMarkerX(score: number) {
  const clamped = Math.min(80, Math.max(30, score));
  return 36 + ((clamped - 30) / 50) * 288;
}

function getPercentileMarkerX(percentile: number) {
  const lowerTail = 1 - clamp(percentile, 0.1, 99.9) / 100;
  const zMax = 2.8;
  const z = clamp(inverseNormalCDF(lowerTail), -zMax, zMax);
  return 36 + ((z + zMax) / (zMax * 2)) * 288;
}

function getCurveY(x: number, compact: boolean) {
  const center = 180;
  const z = ((x - center) / 144) * 2.8;
  const baseline = compact ? 104 : 132;
  const amplitude = compact ? 56 : 88;
  return baseline - amplitude * Math.exp(-(z * z) / 2);
}

function buildCurvePath(compact: boolean) {
  return Array.from({ length: 49 }, (_, index) => {
    const x = 36 + (index / 48) * 288;
    const y = getCurveY(x, compact);
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

export function NormalDistributionChart(props: NormalDistributionChartProps) {
  const variant = props.variant ?? "score";
  const compact = props.compact ?? false;
  const baseline = compact ? 104 : 132;
  let markerX: number;
  let accentColor: string;
  let caption: string | null | undefined;
  let ariaLabel: string;

  if (props.variant === "percentile") {
    markerX = getPercentileMarkerX(props.percentile);
    accentColor = props.accentColor ?? "#3B82F6";
    caption = props.caption;
    ariaLabel = `上位${props.percentile}%の位置`;
  } else {
    markerX = getScoreMarkerX(props.score);
    accentColor = "#E8453C";
    caption =
      props.caption === undefined
        ? `偏差値${props.score}は上位${props.percentile ?? getProfTopPercentile(props.score)}%に位置しています。`
        : props.caption;
    ariaLabel = `偏差値${props.score}は上位${props.percentile ?? getProfTopPercentile(props.score)}%`;
  }

  const markerY = getCurveY(markerX, compact);
  const curvePath = buildCurvePath(compact);
  const areaPath = `${curvePath} L 324 ${baseline} L 36 ${baseline} Z`;
  const title = props.title === undefined ? (variant === "score" ? "偏差値の立ち位置" : null) : props.title;
  const markerLabel = props.markerLabel === undefined ? (variant === "score" ? "あなた" : null) : props.markerLabel;
  const heightClass = compact ? "h-[122px]" : "h-auto";

  return (
    <section className={`rounded-[1.35rem] border border-[color:var(--line)] bg-white px-4 py-4 sm:px-5 ${compact ? "" : "sm:py-5"}`.trim()}>
      {title ? <p className="text-sm font-bold tracking-[0.14em] text-[var(--color-main)]">{title}</p> : null}
      <div className={title ? "mt-4" : ""}>
        <svg viewBox="0 0 360 170" className={`${heightClass} w-full`} role="img" aria-label={ariaLabel}>
          <defs>
            <linearGradient id={`curve-fill-${variant}-${compact ? "compact" : "full"}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.18)" />
              <stop offset="100%" stopColor={variant === "percentile" ? "rgba(59,130,246,0.08)" : "rgba(232,69,60,0.12)"} />
            </linearGradient>
          </defs>

          <path d={curvePath} fill="none" stroke="rgba(26,26,26,0.14)" strokeWidth="3" />
          <path d={areaPath} fill={`url(#curve-fill-${variant}-${compact ? "compact" : "full"})`} />
          <line x1="36" y1={baseline} x2="324" y2={baseline} stroke="rgba(26,26,26,0.18)" strokeWidth="2" />

          <line
            x1={markerX}
            y1={markerY}
            x2={markerX}
            y2={baseline}
            stroke={accentColor}
            strokeWidth="2.5"
            strokeDasharray={variant === "score" ? "4 4" : undefined}
          />
          <circle cx={markerX} cy={baseline} r="7" fill={accentColor} />

          {markerLabel ? (
            <text x={markerX} y={Math.max(26, markerY - 12)} textAnchor="middle" fontSize="12" fontWeight="700" fill={accentColor}>
              {markerLabel}
            </text>
          ) : null}

          {!compact && variant === "score"
            ? tickValues.map((value) => {
                const x = getScoreMarkerX(value);
                return (
                  <g key={value}>
                    <line x1={x} y1={baseline} x2={x} y2={baseline + 8} stroke="rgba(26,26,26,0.18)" strokeWidth="2" />
                    <text x={x} y={baseline + 26} textAnchor="middle" fontSize="12" fill="#6B7280">
                      {value}
                    </text>
                  </g>
                );
              })
            : null}
        </svg>
      </div>
      {caption ? <p className="mt-3 text-sm leading-7 text-[var(--color-text-sub)]">{caption}</p> : null}
    </section>
  );
}
