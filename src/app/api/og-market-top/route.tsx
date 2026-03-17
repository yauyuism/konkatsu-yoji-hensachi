import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter } from "../og-theme";

export const runtime = "edge";

const dots = Array.from({ length: 36 }, (_, index) => ({
  left: 118 + ((index * 33) % 270),
  top: 118 + Math.floor(index / 6) * 26,
}));

export async function GET() {
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
          justifyContent: "space-between",
          alignItems: "center",
          padding: "56px 62px 78px",
          position: "relative",
        }}
      >
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
          {dots.map((dot) => (
            <div
              key={`${dot.left}-${dot.top}`}
              style={{
                position: "absolute",
                left: dot.left,
                top: dot.top,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: hexToRgba(ogPalette.textMain, 0.18),
                display: "flex",
              }}
            />
          ))}

          <div
            style={{
              width: 310,
              height: 310,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(232,69,60,0.12) 0%, rgba(232,69,60,0.04) 58%, transparent 72%)",
            }}
          >
            <div
              style={{
                width: 220,
                height: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 36,
                background: hexToRgba("#FFFFFF", 0.88),
                boxShadow: "0 24px 60px rgba(26,26,26,0.08)",
              }}
            >
              <div style={{ display: "flex", fontSize: 20, color: ogPalette.textSub }}>年収換算</div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 88,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: ogPalette.accent,
                  fontFamily: "Outfit",
                }}
              >
                680
              </div>
              <div style={{ display: "flex", marginTop: 6, fontSize: 22, color: ogPalette.textSub }}>万円相当</div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div style={pillStyle()}>{`MARKET VALUE`}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 52, fontWeight: 700, lineHeight: 1.18 }}>
            <div style={{ display: "flex" }}>あなたの婚活スペック、</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>年収換算でどのくらい？</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, lineHeight: 1.65, color: ogPalette.textSub }}>
            年齢・年収・身長・学歴・居住地から、婚活スペックの希少性を年収換算で見直します。
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              padding: "12px 18px",
              borderRadius: 18,
              background: hexToRgba("#FFFFFF", 0.8),
              fontSize: 20,
              color: ogPalette.textSub,
            }}
          >
            条件チェッカーの逆視点
          </div>
        </div>
      </div>

      {renderFooter("shindanlab.jp/market")}
    </div>
  );
}
