import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter } from "../og-theme";
import { WEIGHT_JUDGMENT_META, getSituationOption, type WeightJudgment } from "@/data/weight";

export const runtime = "edge";

function parseJudgment(value: string | null): WeightJudgment {
  if (value === "light" || value === "balanced" || value === "heavy" || value === "very_heavy") {
    return value;
  }

  return "balanced";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const totalWeight = Number(searchParams.get("w") ?? "2.4");
  const partnerWeight = Number(searchParams.get("pw") ?? "1.5");
  const situation = getSituationOption((searchParams.get("s") as Parameters<typeof getSituationOption>[0] | null) ?? "app_match");
  const judgment = WEIGHT_JUDGMENT_META[parseJudgment(searchParams.get("j"))];
  const inputMode = searchParams.get("im") === "images" ? "images" : "text";
  const topFactor = searchParams.get("tf")?.slice(0, 20) ?? "話題起点率";
  const factorWeight = searchParams.get("fw") ?? "0.8";
  const diff = Number.isFinite(totalWeight - partnerWeight) ? (totalWeight - partnerWeight).toFixed(1) : "0.9";

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          paddingBottom: 36,
        }}
      >
        <div style={pillStyle()}>{`MESSAGE WEIGHT`}</div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 26, color: ogPalette.textSub }}>{situation.label}</div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 18, color: ogPalette.gray }}>
          {inputMode === "images" ? "スクショ入力" : "テキスト入力"}
        </div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 22, color: ogPalette.textSub }}>あなたのメッセージ重量</div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 10, gap: 10 }}>
          <div
            style={{
              display: "flex",
              fontSize: 144,
              fontWeight: 800,
              lineHeight: 1,
              color: judgment.color,
              fontFamily: "Outfit",
              textShadow: `0 6px 24px ${hexToRgba(judgment.color, 0.16)}`,
            }}
          >
            {Number.isFinite(totalWeight) ? totalWeight.toFixed(1) : "2.4"}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: ogPalette.textSub }}>kg</div>
        </div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 30, fontWeight: 700, color: judgment.color }}>{judgment.label}</div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 22, color: ogPalette.textSub }}>
          {`相手 ${Number.isFinite(partnerWeight) ? partnerWeight.toFixed(1) : "1.5"}kg / 重量差 ${Number(diff) > 0 ? "+" : ""}${diff}kg`}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            padding: "18px 24px",
            borderRadius: 26,
            border: `1px solid ${hexToRgba(ogPalette.textMain, 0.08)}`,
            background: hexToRgba("#FFFFFF", 0.82),
            fontSize: 22,
            color: ogPalette.textMain,
          }}
        >
          {`一番の原因: ${topFactor} (+${factorWeight}kg)`}
        </div>
      </div>

      {renderFooter("#LINEメッセージ重量")}
    </div>
  );
}
