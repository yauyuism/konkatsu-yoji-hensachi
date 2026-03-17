import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "../og-theme";
import { getConditionsOgTone } from "../og-conditions-tone";
import { EDUCATIONS, GENDER_LABELS, REGIONS } from "@/data/conditions";
import { getAgeLabel, getConditionsResultFromSearchParams, getHeightLabel, getIncomeLabel } from "@/lib/conditions";

export const runtime = "edge";

function buildConditionChips(searchParams: URLSearchParams) {
  const { conditions } = getConditionsResultFromSearchParams(Object.fromEntries(searchParams.entries()));

  return [
    GENDER_LABELS[conditions.targetGender],
    getAgeLabel(conditions.ageMin, conditions.ageMax),
    getIncomeLabel(conditions.incomeMin, conditions.incomeMax),
    getHeightLabel(conditions.targetGender, conditions.heightMin, conditions.heightMax),
    EDUCATIONS[conditions.education],
    REGIONS[conditions.region].label,
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nParam = Number(searchParams.get("n") ?? Number.NaN);
  const pParam = Number(searchParams.get("p") ?? Number.NaN);
  const fallback = getConditionsResultFromSearchParams(Object.fromEntries(searchParams.entries()));
  const count = Number.isFinite(nParam) && nParam >= 0 ? Math.round(nParam) : fallback.summary.count;
  const percentage = Number.isFinite(pParam) && pParam >= 0 ? pParam : fallback.summary.percentage;
  const impact = fallback.summary.impacts[0];
  const chips = buildConditionChips(searchParams);
  const tone = getConditionsOgTone(percentage);
  const accentColor = tone.accent;
  const impactTitle = impact?.condition ?? "複数条件";
  const impactBody =
    !impact || impact.multiplier === null
      ? "複数条件の掛け算で母数がじわっと削られています。"
      : `${impact.condition}を緩めると ×${impact.multiplier.toFixed(1)}`;

  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #F8F7F4 0%, #FFF7F2 100%)",
        color: ogPalette.textMain,
        fontFamily: "Zen Kaku Gothic New",
      }}
    >
      {renderBackdrop(tone.accent, tone.secondary)}

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "52px 58px 78px",
          position: "relative",
        }}
      >
        <SoftCard
          style={{
            width: 540,
            padding: "34px 34px 30px",
            borderRadius: 42,
            background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,248,245,0.94) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={pillStyle(accentColor)}>{`CONDITION CHECK`}</div>
            <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: accentColor }}>{tone.label}</div>
          </div>

          <div style={{ display: "flex", marginTop: 26, fontSize: 22, color: ogPalette.textSub }}>あなたの条件は</div>
          <div style={{ display: "flex", marginTop: 8, alignItems: "flex-end", gap: 12 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Outfit",
                fontSize: 156,
                lineHeight: 1,
                fontWeight: 800,
                color: accentColor,
                letterSpacing: "-0.05em",
                textShadow: `0 12px 30px ${hexToRgba(accentColor, 0.16)}`,
              }}
            >
              {percentage.toFixed(2)}%
            </div>
          </div>

          <div style={{ display: "flex", marginTop: 10, fontSize: 30, fontWeight: 700, color: ogPalette.textMain }}>
            未婚者全体で見ると 約 {count.toLocaleString()} 人
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              padding: "18px 20px",
              borderRadius: 26,
              background: hexToRgba(accentColor, 0.08),
              border: `1px solid ${hexToRgba(accentColor, 0.12)}`,
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: accentColor }}>いちばん効いてる条件</div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: ogPalette.textMain }}>{impactTitle}</div>
            <div style={{ display: "flex", fontSize: 22, lineHeight: 1.5, color: ogPalette.textSub }}>{impactBody}</div>
          </div>
        </SoftCard>

        <div
          style={{
            width: "43%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={pillStyle()}>{`RESULT`}</div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 18,
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.14,
              letterSpacing: "-0.03em",
            }}
          >
            <div style={{ display: "flex" }}>理想条件、</div>
            <div style={{ display: "flex", color: accentColor }}>{tone.headline}</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 16,
              maxWidth: 460,
              fontSize: 24,
              lineHeight: 1.62,
              color: ogPalette.textSub,
            }}
          >
            {tone.body}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
            {chips.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  padding: "12px 16px",
                  borderRadius: 16,
                  background: hexToRgba("#FFFFFF", 0.92),
                  border: `1px solid ${hexToRgba(ogPalette.textMain, 0.08)}`,
                  fontSize: 19,
                  fontWeight: 700,
                  color: ogPalette.textMain,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderFooter("#条件リアリティチェック")}
    </div>
  );
}
