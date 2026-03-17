import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter } from "../og-theme";

export const runtime = "edge";

const colors = [
  "#E8453C", "#F97316", "#F59E0B", "#FB7185",
  "#3B82F6", "#6366F1", "#8B5CF6", "#64748B",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#1D4ED8", "#2563EB", "#7C3AED", "#EC4899",
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
          }}
        >
          <div
            style={{
              display: "flex",
              width: 292,
              flexWrap: "wrap",
              gap: 14,
              transform: "rotate(-5deg)",
            }}
          >
            {colors.map((color, index) => (
              <div
                key={color}
                style={{
                  width: index === 0 ? 74 : 62,
                  height: index === 0 ? 74 : 62,
                  borderRadius: 20,
                  background: color,
                  boxShadow: index === 0 ? `0 14px 36px ${hexToRgba(color, 0.32)}` : "none",
                  transform: index === 0 ? "scale(1.06)" : "scale(1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF", display: "flex" }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF", display: "flex" }} />
              </div>
            ))}
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
          <div style={pillStyle()}>{`MATCHING APP TYPE`}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 50, fontWeight: 700, lineHeight: 1.18 }}>
            <div style={{ display: "flex" }}>あなたのマッチングアプリ</div>
            <div style={{ display: "flex", color: ogPalette.accent }}>タイプは？</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, lineHeight: 1.65, color: ogPalette.textSub }}>
            4軸16タイプ診断。やり方、見極め方、攻め方のクセをタイプごとに言語化します。
          </div>
        </div>
      </div>

      {renderFooter("shindanlab.jp/type")}
    </div>
  );
}
