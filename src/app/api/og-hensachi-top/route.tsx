import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter } from "../og-theme";

export const runtime = "edge";

const chartPoints = "160,80 238,132 208,232 112,232 82,132";

export async function GET() {
  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F8F7F4 0%, #F3F8FF 100%)",
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
          <svg
            width="360"
            height="360"
            viewBox="0 0 320 320"
            style={{ display: "flex", overflow: "visible" }}
          >
            {[120, 92, 64].map((radius) => (
              <polygon
                key={radius}
                points={Array.from({ length: 5 }, (_, index) => {
                  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5;
                  const x = 160 + Math.cos(angle) * radius;
                  const y = 160 + Math.sin(angle) * radius;
                  return `${x},${y}`;
                }).join(" ")}
                fill="none"
                stroke={hexToRgba(ogPalette.textMain, 0.14)}
                strokeWidth="2"
              />
            ))}
            <polygon points={chartPoints} fill={hexToRgba(ogPalette.accent, 0.22)} stroke={ogPalette.accent} strokeWidth="4" />
            <circle cx="160" cy="160" r="140" fill="none" stroke={ogPalette.accent} strokeWidth="4" strokeDasharray="12 12" />
          </svg>
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
          <div style={pillStyle()}>{`APP HENSACHI`}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 54, fontWeight: 700, lineHeight: 1.18 }}>
            <div style={{ display: "flex" }}>あなたの</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>アプリ偏差値を</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>採点。</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, lineHeight: 1.65, color: ogPalette.textSub }}>
            16問・約3分。プロフィール力・写真力・会話力・見極め力・継続力を5軸で可視化します。
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: ogPalette.textMain }}>質問に答えるだけで進みます</div>
        </div>
      </div>

      {renderFooter("shindanlab.jp/hensachi")}
    </div>
  );
}
