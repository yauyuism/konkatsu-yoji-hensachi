import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter } from "../og-theme";

export const runtime = "edge";

const chips = ["マチアプ疲れ", "いい人なのに好きになれない", "相談所前の整理"];

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
      {renderBackdrop(ogPalette.accent, ogPalette.orange)}

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 46,
          padding: "58px 62px 78px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "47%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={pillStyle()}>{`婚活のセカンドオピニオン`}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 52, fontWeight: 700, lineHeight: 1.2 }}>
            <div style={{ display: "flex" }}>会えるのに</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>進まない理由を、</div>
            <div style={{ display: "flex" }}>出会い方から整理する。</div>
          </div>
          <div style={{ display: "flex", maxWidth: 500, fontSize: 24, lineHeight: 1.65, color: ogPalette.textSub }}>
            もっと頑張らせる相談ではなく、合っていない頑張り方を見直す相談です。
          </div>
        </div>

        <div
          style={{
            width: "43%",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            borderRadius: 38,
            border: `1px solid ${hexToRgba(ogPalette.textMain, 0.08)}`,
            background: hexToRgba("#FFFFFF", 0.88),
            boxShadow: "0 28px 70px rgba(26,26,26,0.1)",
            padding: "34px 34px 32px",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: ogPalette.textMain }}>
            相手を紹介するサービスではありません。
          </div>
          <div style={{ display: "flex", fontSize: 20, lineHeight: 1.7, color: ogPalette.textSub }}>
            今の婚活の進め方、出会い方、判断の速度、プロフィールの入口を一緒に整理します。
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            {chips.map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: hexToRgba(ogPalette.accent, 0.08),
                  color: ogPalette.accent,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 10,
              padding: "16px 18px",
              borderRadius: 22,
              background: hexToRgba("#FFF5F0", 0.92),
              fontSize: 20,
              fontWeight: 700,
              color: ogPalette.textMain,
            }}
          >
            相手選びの前に、出会い方選び。
          </div>
        </div>
      </div>

      {renderFooter("shindanlab.jp/consultation")}
    </div>
  );
}
