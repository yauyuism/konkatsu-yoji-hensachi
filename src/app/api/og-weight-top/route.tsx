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
          <SoftCard
            style={{
              width: 372,
              padding: "30px 26px",
              borderRadius: 38,
              gap: 18,
              background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,248,245,0.92) 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-end",
                maxWidth: 240,
                padding: "16px 18px",
                borderRadius: 28,
                background: hexToRgba(ogPalette.accent, 0.14),
                color: ogPalette.textMain,
                fontSize: 20,
                lineHeight: 1.5,
              }}
            >
              え、今の一文ちょっと重かった？
            </div>
            <div
              style={{
                display: "flex",
                width: 64,
                height: 2,
                marginLeft: "auto",
                background: hexToRgba(ogPalette.textMain, 0.12),
              }}
            />
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                maxWidth: 256,
                padding: "16px 18px",
                borderRadius: 28,
                background: hexToRgba(ogPalette.blue, 0.12),
                color: ogPalette.textMain,
                fontSize: 20,
                lineHeight: 1.5,
              }}
            >
              スクショでもテキストでも、そのまま読ませればOK。
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "Outfit",
                  fontSize: 88,
                  lineHeight: 1,
                  fontWeight: 800,
                  color: ogPalette.accent,
                }}
              >
                2.4
              </div>
              <div style={{ display: "flex", fontSize: 24, color: ogPalette.textSub }}>kg</div>
            </div>
          </SoftCard>
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
          <div style={pillStyle()}>{`MESSAGE WEIGHT`}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 54, fontWeight: 700, lineHeight: 1.18 }}>
            <div style={{ display: "flex" }}>あなたのLINE、</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>何kgある？</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, lineHeight: 1.65, color: ogPalette.textSub }}>
            スクショやテキストを貼るだけで、メッセージの重さをkg単位で測ります。
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: ogPalette.textMain }}>
            軽い・普通・重いをその場で可視化。
          </div>
        </div>
      </div>

      {renderFooter("shindanlab.jp/weight")}
    </div>
  );
}
