import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "../og-theme";
import { getConditionsOgTone } from "../og-conditions-tone";

export const runtime = "edge";

const featurePills = ["手動入力", "スクショ読取", "即時計算"];
const exampleRows = [
  ["男性", "25〜35歳", "年収500万+"],
  ["170cm+", "大卒", "東京"],
];
const exampleTone = getConditionsOgTone(0.31);

function infoPill(label: string, tone: "default" | "green" | "blue" = "default") {
  const toneMap = {
    default: {
      border: hexToRgba(ogPalette.textMain, 0.08),
      background: hexToRgba("#FFFFFF", 0.9),
      color: ogPalette.textMain,
    },
    green: {
      border: hexToRgba(ogPalette.green, 0.18),
      background: hexToRgba(ogPalette.green, 0.1),
      color: ogPalette.green,
    },
    blue: {
      border: hexToRgba(ogPalette.blue, 0.18),
      background: hexToRgba(ogPalette.blue, 0.1),
      color: ogPalette.blue,
    },
  } as const;

  const colors = toneMap[tone];

  return (
    <div
      style={{
        display: "flex",
        padding: "12px 16px",
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        background: colors.background,
        color: colors.color,
        fontSize: 18,
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  );
}

export async function GET() {
  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F8F7F4 0%, #FFF4EE 100%)",
        color: ogPalette.textMain,
        fontFamily: "Zen Kaku Gothic New",
      }}
    >
      {renderBackdrop(exampleTone.accent, exampleTone.secondary)}

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "56px 58px 78px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "48%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={pillStyle()}>{`CONDITION CHECK`}</div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 20,
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            <div style={{ display: "flex" }}>あなたの“普通”は、</div>
            <div style={{ display: "flex", color: exampleTone.accent }}>日本に何人いる？</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 20,
              maxWidth: 520,
              fontSize: 24,
              lineHeight: 1.62,
              color: ogPalette.textSub,
            }}
          >
            条件を入れるだけで、未婚者全体の割合と人数を返します。感覚ではなく、母数で見るためのチェックです。
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            {featurePills.map((item) => (
              <div key={item} style={{ display: "flex" }}>
                {infoPill(item, item === "スクショ読取" ? "blue" : "default")}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", marginTop: 22, fontSize: 22, fontWeight: 700, color: ogPalette.textMain }}>
            統計データからリアルタイムで算出。
          </div>
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
              position: "absolute",
              right: 10,
              top: 94,
              display: "flex",
              transform: "rotate(6deg)",
            }}
          >
            {infoPill("NEW スクショ読取", "blue")}
          </div>

          <SoftCard
            style={{
              width: 438,
              padding: "30px 28px 28px",
              borderRadius: 40,
              gap: 18,
              background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,248,245,0.92) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={pillStyle(exampleTone.accent)}>{`EXAMPLE`}</div>
              <div style={{ display: "flex", fontSize: 18, color: exampleTone.accent }}>{exampleTone.label}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 20, color: ogPalette.textSub }}>未婚者全体の</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 6 }}>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Outfit",
                    fontSize: 118,
                    lineHeight: 1,
                    fontWeight: 800,
                    color: exampleTone.accent,
                    letterSpacing: "-0.05em",
                    textShadow: `0 10px 28px ${hexToRgba(exampleTone.accent, 0.16)}`,
                  }}
                >
                  0.31%
                </div>
                <div style={{ display: "flex", marginBottom: 18, fontSize: 24, fontWeight: 700 }}>です</div>
              </div>
              <div style={{ display: "flex", marginTop: 6, fontSize: 28, fontWeight: 700, color: ogPalette.textMain }}>
                約 64,228 人
              </div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 19, lineHeight: 1.5, color: ogPalette.textSub }}>
                {exampleTone.body}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {exampleRows.map((row, index) => (
                <div key={index} style={{ display: "flex", gap: 10 }}>
                  {row.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        padding: "10px 14px",
                        borderRadius: 16,
                        background: hexToRgba(ogPalette.textMain, 0.05),
                        color: ogPalette.textMain,
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px",
                borderRadius: 24,
                background: hexToRgba(exampleTone.secondary, 0.12),
                border: `1px solid ${hexToRgba(exampleTone.secondary, 0.2)}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: exampleTone.secondary }}>いちばん効く条件</div>
                <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: ogPalette.textMain }}>年収を外すと</div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Outfit",
                  fontSize: 54,
                  fontWeight: 800,
                  color: exampleTone.secondary,
                  lineHeight: 1,
                }}
              >
                ×5.4
              </div>
            </div>
          </SoftCard>
        </div>
      </div>

      {renderFooter("shindanlab.jp/conditions")}
    </div>
  );
}
