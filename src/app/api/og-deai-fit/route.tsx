import { createOgImage, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "../og-theme";
import { DEAI_FIT_RESULTS, isDeaiFitType, type DeaiFitType } from "@/lib/deai-fit";
import { DEAI_FIT_DISPLAY_META } from "@/lib/deai-fit-display";

export const runtime = "edge";

function resolveType(value: string | null): DeaiFitType {
  return isDeaiFitType(value) ? value : "F-V-S-N";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = resolveType(searchParams.get("result"));
  const meta = DEAI_FIT_DISPLAY_META[type];
  const result = DEAI_FIT_RESULTS[type];
  const suited = result.suited.slice(0, 3);
  const notFit = result.notFit[0] ?? "短期判断の婚活";

  return createOgImage(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F8F7F4 0%, #FFF4ED 100%)",
        color: ogPalette.textMain,
        fontFamily: "Zen Kaku Gothic New",
      }}
    >
      {renderBackdrop(ogPalette.accent, ogPalette.green)}

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 34,
          padding: "46px 54px 76px",
          position: "relative",
        }}
      >
        <SoftCard
          style={{
            width: 520,
            minHeight: 454,
            padding: "34px 34px 30px",
            borderRadius: 42,
            background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,248,245,0.94) 100%)",
          }}
        >
          <div style={pillStyle()}>{`RESULT CARD`}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 24, fontWeight: 700, color: ogPalette.textSub }}>
            あなたに合う出会い方診断
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 26, color: ogPalette.textSub }}>あなたは</div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.08,
              color: ogPalette.accent,
            }}
          >
            {meta.resultLabel}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 25, lineHeight: 1.55, color: ogPalette.textMain }}>
            {meta.shareCopy}
          </div>
        </SoftCard>

        <div
          style={{
            width: 520,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={pillStyle(ogPalette.green)}>{`あなたの出会い方の地図`}</div>

          <SoftCard style={{ padding: "28px 30px", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: ogPalette.accent, letterSpacing: "0.12em" }}>
              向いている出会い方
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {suited.map((item, index) => (
                <div key={item} style={{ display: "flex", fontSize: 25, fontWeight: 700, color: ogPalette.textMain }}>
                  {index + 1}. {item}
                </div>
              ))}
            </div>
          </SoftCard>

          <SoftCard style={{ padding: "28px 30px", gap: 12 }}>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: ogPalette.accent, letterSpacing: "0.12em" }}>
              疲れやすい出会い方
            </div>
            <div style={{ display: "flex", fontSize: 25, fontWeight: 700, color: ogPalette.textMain }}>
              {notFit}
            </div>
          </SoftCard>
        </div>
      </div>

      {renderFooter("shindanlab.jp/diagnoses/deai-fit", "@yauyuism")}
    </div>
  );
}
