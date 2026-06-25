import { createOgImage, hexToRgba, ogPalette, renderBackdrop, renderFooter, pillStyle, SoftCard } from "../og-theme";

export const runtime = "edge";

const floatingIcons = [
  { left: 128, top: 138, label: "✓", color: ogPalette.accent },
  { left: 350, top: 118, label: "♥", color: ogPalette.orange },
  { left: 332, top: 412, label: "▥", color: ogPalette.blue },
];

export async function GET() {
  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F8F7F4 0%, #FFF2EB 100%)",
        color: ogPalette.textMain,
        fontFamily: "Zen Kaku Gothic New",
      }}
    >
      {renderBackdrop(ogPalette.accent, ogPalette.blue)}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "54px 62px 76px",
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
          <div
            style={{
              position: "relative",
              width: 282,
              height: 520,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 42,
              border: `2px solid ${ogPalette.line}`,
              background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,250,248,0.9) 100%)",
              boxShadow: "0 34px 80px rgba(26,26,26,0.12)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                width: 88,
                height: 8,
                borderRadius: 999,
                background: hexToRgba(ogPalette.textMain, 0.12),
                display: "flex",
              }}
            />
            <SoftCard
              style={{
                width: 218,
                padding: "24px 22px 20px",
                gap: 18,
                borderRadius: 30,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", fontSize: 14, fontWeight: 700, letterSpacing: "0.16em", color: ogPalette.accent }}>
                  婚活診断LAB by やうゆ
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ width: 18, height: 72, borderRadius: 999, background: ogPalette.accent, display: "flex" }} />
                    <div style={{ width: 18, height: 94, borderRadius: 999, background: ogPalette.orange, display: "flex" }} />
                    <div style={{ width: 18, height: 54, borderRadius: 999, background: ogPalette.blue, display: "flex" }} />
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      width: 72,
                      height: 72,
                      borderRadius: 999,
                      background: hexToRgba(ogPalette.accent, 0.12),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: ogPalette.accent,
                      fontSize: 32,
                      fontWeight: 700,
                    }}
                  >
                    ♥
                  </div>
                </div>
              </div>
            </SoftCard>
          </div>

          {floatingIcons.map((icon) => (
            <div
              key={`${icon.left}-${icon.top}`}
              style={{
                position: "absolute",
                left: icon.left,
                top: icon.top,
                width: 56,
                height: 56,
                borderRadius: 999,
                border: `1px solid ${hexToRgba(icon.color, 0.16)}`,
                background: hexToRgba("#FFFFFF", 0.84),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: icon.color,
                fontSize: 24,
                fontWeight: 700,
                opacity: 0.88,
              }}
            >
              {icon.label}
            </div>
          ))}
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
          <div style={pillStyle()}>{`婚活診断LAB by やうゆ`}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 58, fontWeight: 700, lineHeight: 1.18 }}>
            <div style={{ display: "flex" }}>診断で、</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>恋愛や婚活の癖を知る。</div>
          </div>
          <div style={{ display: "flex", maxWidth: 500, fontSize: 24, lineHeight: 1.65, color: ogPalette.textSub }}>
            診断は採点ではなく、自己理解の入口。自分に合う出会い方から婚活を組み直すための診断メディアです。
          </div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 22, fontWeight: 700, color: ogPalette.textMain }}>
            shindanlab.jp
          </div>
        </div>
      </div>

      {renderFooter("shindanlab.jp")}
    </div>
  );
}
