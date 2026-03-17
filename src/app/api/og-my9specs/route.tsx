import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "@/app/api/og-theme";
import type { CustomSpecInput } from "@/lib/my9specs";
import { getMy9SpecsEstimate, getSelectedSpecs, parseMy9SpecsSearchParams } from "@/lib/my9specs";

export const runtime = "edge";

const SAMPLE_IDS = [
  "inc_500",
  "height_170",
  "char_funny",
  "edu_college",
  "area_tokyo",
  "life_nosmoking",
  "life_children",
  "char_calm",
  "hobby_travel",
];

function renderGrid(selectedIds: string[], customInputs: CustomSpecInput[] = []) {
  const selected = getSelectedSpecs(selectedIds, customInputs);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      {selected.slice(0, 9).map((option) => (
        <div
          key={option.id}
          style={{
            width: "152px",
            height: "120px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.96)",
            border: `1px solid ${hexToRgba(ogPalette.textMain, 0.08)}`,
            padding: "12px",
          }}
        >
          <div style={{ display: "flex", fontSize: "28px" }}>{option.emoji}</div>
          <div
            style={{
              display: "flex",
              marginTop: "8px",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: 1.28,
              color: ogPalette.textMain,
              maxWidth: "120px",
            }}
          >
            {option.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const topMode = mode === "top";
  const { targetGender, presetIds, customInputs } = parseMy9SpecsSearchParams(Object.fromEntries(searchParams.entries()));
  const effectivePresetIds = topMode || getSelectedSpecs(presetIds, customInputs).length === 0 ? SAMPLE_IDS : presetIds;
  const effectiveCustomInputs = topMode ? [] : customInputs;
  const estimate = getMy9SpecsEstimate(getSelectedSpecs(effectivePresetIds, effectiveCustomInputs), targetGender);
  const numberLabel = topMode ? "人数がその場で出る" : `${estimate.count.toLocaleString()}人`;
  const subLabel = topMode
    ? "譲れない条件を9つ選ぶと、理想条件の画像と推計人数が出る。"
    : `この9条件を全部満たす人は日本に約${estimate.count.toLocaleString()}人。`;

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
      {renderBackdrop(ogPalette.accent, ogPalette.blue)}

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "48px 52px 74px",
          gap: "28px",
        }}
      >
        <SoftCard
          style={{
            width: 540,
            padding: "30px 30px 26px",
            borderRadius: 42,
            background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,249,245,0.94) 100%)",
          }}
        >
          <div style={pillStyle()}>{`MY 9 SPECS`}</div>
          <div
            style={{
              display: "flex",
              marginTop: "20px",
              fontSize: "54px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
            }}
          >
            私が譲れない
            <span style={{ color: ogPalette.accent, marginLeft: "10px" }}>9条件</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "16px",
              fontSize: "24px",
              lineHeight: 1.6,
              color: ogPalette.textSub,
              maxWidth: "430px",
            }}
          >
            {subLabel}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "28px",
              padding: "18px 20px",
              borderRadius: "24px",
              background: hexToRgba(ogPalette.accent, 0.08),
              border: `1px solid ${hexToRgba(ogPalette.accent, 0.12)}`,
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", fontSize: "16px", fontWeight: 700, color: ogPalette.accent }}>
              {topMode ? "選ぶとこうなる" : "結果"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                fontFamily: "Outfit",
                fontSize: topMode ? "56px" : "68px",
                lineHeight: 1,
                fontWeight: 800,
                color: ogPalette.accent,
              }}
            >
              {numberLabel}
            </div>
            <div style={{ display: "flex", fontSize: "20px", color: ogPalette.textSub }}>
              {topMode ? "3×3カード付きでシェア可能" : estimate.reliabilityLabel}
            </div>
          </div>
        </SoftCard>

        <div
          style={{
            width: "560px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={pillStyle(hexToRgba(ogPalette.blue, 1))}>{`SELECTED SPECS`}</div>
          <div
            style={{
              display: "flex",
              marginTop: "18px",
              fontSize: "28px",
              fontWeight: 700,
              color: ogPalette.textMain,
            }}
          >
            9つ選ぶと、理想条件が1枚にまとまる
          </div>
          <div style={{ display: "flex", marginTop: "18px" }}>{renderGrid(effectivePresetIds, effectiveCustomInputs)}</div>
        </div>
      </div>

      {renderFooter("#私の譲れない9条件")}
    </div>
  );
}
