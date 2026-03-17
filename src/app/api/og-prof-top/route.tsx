import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "../og-theme";

export const runtime = "edge";

export async function GET() {
  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at top right, #FFF1EB 0%, #F8F7F4 58%)",
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
          <SoftCard
            style={{
              width: 380,
              padding: "34px 32px",
              borderRadius: 38,
              gap: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: -26,
                  top: 52,
                  width: 430,
                  height: 3,
                  background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(ogPalette.accent, 0.6)} 26%, ${hexToRgba(ogPalette.accent, 0.05)} 100%)`,
                  transform: "rotate(-16deg)",
                }}
              />
              <div style={{ display: "flex", width: "100%", height: 14, borderRadius: 999, background: hexToRgba(ogPalette.textMain, 0.08) }} />
              <div style={{ display: "flex", width: "84%", height: 14, borderRadius: 999, background: hexToRgba(ogPalette.textMain, 0.08) }} />
              <div style={{ display: "flex", width: "92%", height: 14, borderRadius: 999, background: hexToRgba(ogPalette.textMain, 0.08) }} />
              <div style={{ display: "flex", width: "70%", height: 14, borderRadius: 999, background: hexToRgba(ogPalette.textMain, 0.08) }} />
            </div>
          </SoftCard>

          <div style={{ position: "absolute", left: 96, top: 172, width: 22, height: 22, borderRadius: "50%", background: hexToRgba(ogPalette.accent, 0.86), display: "flex" }} />
          <div style={{ position: "absolute", left: 116, top: 236, width: 22, height: 22, borderRadius: "50%", background: hexToRgba(ogPalette.accent, 0.62), display: "flex" }} />
          <div style={{ position: "absolute", left: 328, top: 196, width: 22, height: 22, borderRadius: "50%", background: hexToRgba(ogPalette.blue, 0.7), display: "flex" }} />
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
          <div style={pillStyle()}>{`PROFILE CHECK`}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 54, fontWeight: 700, lineHeight: 1.18 }}>
            <div style={{ display: "flex" }}>あなたのプロフ、</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>異性からどう見えてる？</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, lineHeight: 1.65, color: ogPalette.textSub }}>
            プロフィール文を貼るだけ。AIが5つの観点でスコア化し、改善案までまとめて返します。
          </div>
        </div>
      </div>

      {renderFooter("shindanlab.jp/prof")}
    </div>
  );
}
