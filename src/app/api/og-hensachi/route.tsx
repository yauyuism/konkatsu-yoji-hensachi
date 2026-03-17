import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "../og-theme";
import { hensachiAxisOrder } from "@/data/hensachi-questions";
import { buildHensachiResultFromSearchParams } from "@/lib/hensachi";

export const runtime = "edge";

const axisBarColors: Record<string, string> = {
  profile: "#E8453C",
  photo: "#F97316",
  talk: "#3B82F6",
  judge: "#6B7280",
  grit: "#1A1A1A",
};

function getAxisFill(score: number) {
  const normalized = ((score - 25) / 55) * 100;
  return `${Math.max(0, Math.min(100, Math.round(normalized)))}%`;
}

function getRadarPoints(values: number[]) {
  const centerX = 176;
  const centerY = 182;
  const maxRadius = 110;

  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
      const radius = ((Math.max(25, Math.min(80, value)) - 25) / 55) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      return `${x},${y}`;
    })
    .join(" ");
}

function getRingPoints(radius: number) {
  const centerX = 176;
  const centerY = 182;

  return Array.from({ length: 5 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(" ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = buildHensachiResultFromSearchParams(Object.fromEntries(searchParams.entries()));
  const radarValues = hensachiAxisOrder.map((axis) => result.axisDetails.find((detail) => detail.code === axis)?.hensachi ?? 50);

  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F8F7F4 0%, #FFF4ED 100%)",
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
          padding: "38px 42px 70px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 42, top: 34, display: "flex" }}>
          <div style={pillStyle()}>{`APP HENSACHI — RESULT`}</div>
        </div>

        <div
          style={{
            width: "44%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 284,
              height: 284,
              borderRadius: "50%",
              border: `4px solid ${result.color}`,
              background: hexToRgba("#FFFFFF", 0.84),
              boxShadow: `0 24px 60px ${hexToRgba(result.color, 0.16)}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 18, color: ogPalette.textSub, letterSpacing: "0.16em" }}>偏差値</div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 120,
                fontWeight: 800,
                lineHeight: 1,
                color: result.color,
                fontFamily: "Outfit",
              }}
            >
              {result.totalHensachi}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: ogPalette.textMain }}>{result.title}</div>
          <div
            style={{
              display: "flex",
              padding: "10px 18px",
              borderRadius: 999,
              background: hexToRgba(result.color, 0.1),
              border: `1px solid ${hexToRgba(result.color, 0.2)}`,
              color: ogPalette.textMain,
              fontSize: 18,
            }}
          >
            {`通り名「${result.nickname}」`}
          </div>
        </div>

        <div
          style={{
            width: "56%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 26,
          }}
        >
          <div
            style={{
              width: 352,
              height: 352,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="352" height="352" viewBox="0 0 352 352" style={{ display: "flex" }}>
              {[110, 80, 50].map((radius) => (
                <polygon
                  key={radius}
                  points={getRingPoints(radius)}
                  fill="none"
                  stroke={hexToRgba(ogPalette.textMain, 0.14)}
                  strokeWidth="2"
                />
              ))}
              <polygon points={getRadarPoints(radarValues)} fill={hexToRgba(result.color, 0.24)} stroke={result.color} strokeWidth="4" />
            </svg>
          </div>

          <SoftCard style={{ flex: 1, padding: "30px 30px 26px", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: ogPalette.textMain }}>科目別スコア</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {hensachiAxisOrder.map((axis) => {
                const detail = result.axisDetails.find((item) => item.code === axis);
                if (!detail) {
                  return null;
                }

                return (
                  <div key={detail.code} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", fontSize: 20, color: ogPalette.textMain }}>{detail.label}</div>
                      <div
                        style={{
                          display: "flex",
                          fontSize: 28,
                          fontWeight: 700,
                          color: axisBarColors[detail.code],
                          fontFamily: "Outfit",
                        }}
                      >
                        {detail.hensachi}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 16,
                        borderRadius: 999,
                        background: "#E9EDF4",
                        display: "flex",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: getAxisFill(detail.hensachi),
                          height: "100%",
                          borderRadius: 999,
                          background: axisBarColors[detail.code],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SoftCard>
        </div>
      </div>

      {renderFooter("#アプリ偏差値")}
    </div>
  );
}
