import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, scoreColor, SoftCard } from "../og-theme";
import { getProfTitleMeta, parseProfShareParams, profAxisLabels, profAxisOrder } from "@/lib/prof";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { scores, improvedTotal } = parseProfShareParams(Object.fromEntries(searchParams.entries()));
  const titleMeta = getProfTitleMeta(scores.total);
  const diff = typeof improvedTotal === "number" ? improvedTotal - scores.total : null;

  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F8F7F4 0%, #FFF3EC 100%)",
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
          <div style={pillStyle()}>{`PROFILE CHECK — RESULT`}</div>
        </div>

        <div
          style={{
            width: "42%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 288,
              height: 288,
              borderRadius: "50%",
              border: `4px solid ${ogPalette.accent}`,
              background: hexToRgba("#FFFFFF", 0.84),
              boxShadow: `0 24px 60px ${hexToRgba(ogPalette.accent, 0.14)}`,
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
                fontSize: 118,
                fontWeight: 800,
                lineHeight: 1,
                color: ogPalette.accent,
                fontFamily: "Outfit",
              }}
            >
              {scores.total}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 86,
              width: 360,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: ogPalette.textMain }}>{titleMeta.title}</div>
            {diff !== null ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  padding: "10px 18px",
                  background: hexToRgba(ogPalette.green, 0.1),
                  border: `1px solid ${hexToRgba(ogPalette.green, 0.2)}`,
                  color: ogPalette.green,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {`改善後見込み ${improvedTotal}（${diff >= 0 ? `+${diff}` : diff}）`}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            width: "58%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <SoftCard style={{ width: 590, padding: "34px 34px 30px", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: ogPalette.textMain }}>5軸スコア</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
              {profAxisOrder.map((axis) => {
                const score = scores[axis];
                const color = scoreColor(score);

                return (
                  <div key={axis} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", fontSize: 20, color: ogPalette.textMain }}>{profAxisLabels[axis]}</div>
                      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color, fontFamily: "Outfit" }}>{score}</div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 18,
                        borderRadius: 999,
                        background: "#E9EDF4",
                        display: "flex",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: `${score}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: color,
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

      {renderFooter("#プロフ偏差値")}
    </div>
  );
}
