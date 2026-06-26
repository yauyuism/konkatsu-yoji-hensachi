import { getSiteUrl } from "@/lib/site-url";
import {
  formatMarketPercent,
  getMarketShareSpecSummary,
  serializeMarketParams,
  type MarketAnalysis,
  type MarketUserSpec,
} from "@/lib/market";
import { MARKET_GENDER_LABELS } from "@/data/market";

const X_HASHTAG = "婚活スペック上位チェック";
const X_VIA = "yauyuism";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getMarketResultPath(user: MarketUserSpec) {
  return `/market/result?${serializeMarketParams(user)}`;
}

export function getMarketResultUrl(user: MarketUserSpec) {
  return `${resolveOrigin()}${getMarketResultPath(user)}`;
}

export function getMarketEditPath(user: MarketUserSpec) {
  return `/market?${serializeMarketParams(user)}`;
}

export function getMarketOgImageUrl(user: MarketUserSpec) {
  return `/api/og-market?${serializeMarketParams(user)}`;
}

export function getMarketXShareUrl(user: MarketUserSpec, analysis: MarketAnalysis) {
  const text = `婚活スペックを見たら、未婚${MARKET_GENDER_LABELS[user.gender]}の上位${formatMarketPercent(analysis.overallPercentile)}%でした。

${getMarketShareSpecSummary(user)}

ちょっと面白かったので置いておく。`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(getMarketResultUrl(user))}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}

export function getMarketLineShareUrl(user: MarketUserSpec, analysis: MarketAnalysis) {
  const text = `婚活スペック上位チェックの結果は、未婚${MARKET_GENDER_LABELS[user.gender]}の上位${formatMarketPercent(
    analysis.overallPercentile
  )}%。${getMarketShareSpecSummary(
    user
  )} / スペック条件の希少性を上位割合で見ています。`;

  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    getMarketResultUrl(user)
  )}&text=${encodeURIComponent(text)}`;
}
