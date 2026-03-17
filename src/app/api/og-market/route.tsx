import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter } from "../og-theme";
import { formatMarketPercent, getMarketResultFromSearchParams, getMarketShareSpecSummary } from "@/lib/market";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { analysis, user } = getMarketResultFromSearchParams(Object.fromEntries(searchParams.entries()));
  const barWidth = Math.max(12, Math.min(88, 100 - analysis.overallPercentile));

  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F8F7F4 0%, #FFF6F0 100%)",
        color: ogPalette.textMain,
        fontFamily: "Zen Kaku Gothic New",
      }}
    >
      {renderBackdrop(ogPalette.accent, ogPalette.blue)}

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          paddingBottom: 36,
        }}
      >
        <div style={pillStyle()}>{`MARKET VALUE`}</div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 28, color: ogPalette.textSub }}>
          あなたの婚活スペックの希少性は
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 10, gap: 10 }}>
          <div style={{ display: "flex", fontSize: 26, color: ogPalette.textSub }}>年収</div>
          <div
            style={{
              display: "flex",
              fontSize: 144,
              fontWeight: 800,
              lineHeight: 1,
              color: ogPalette.accent,
              fontFamily: "Outfit",
              textShadow: `0 6px 24px ${hexToRgba(ogPalette.accent, 0.18)}`,
            }}
          >
            {analysis.incomeEquivalent}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: ogPalette.textSub }}>万円</div>
        </div>
        <div style={{ display: "flex", marginTop: 4, fontSize: 30, fontWeight: 700, color: ogPalette.textMain }}>
          相当のレア度
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 24, color: ogPalette.textSub }}>
          {`未婚同性の上位 ${formatMarketPercent(analysis.overallPercentile)}%`}
        </div>
        <div
          style={{
            width: 420,
            height: 18,
            display: "flex",
            marginTop: 22,
            borderRadius: 999,
            overflow: "hidden",
            background: hexToRgba(ogPalette.blue, 0.14),
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              display: "flex",
              borderRadius: 999,
              background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            maxWidth: 820,
            textAlign: "center",
            fontSize: 20,
            color: ogPalette.textSub,
            lineHeight: 1.6,
          }}
        >
          {getMarketShareSpecSummary(user)}
        </div>
      </div>

      {renderFooter("#婚活スペック年収換算")}
    </div>
  );
}
