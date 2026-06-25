import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "../og-theme";
import { FATIGUE_REASON_ACTION_GUIDES, type FatigueReasonType } from "@/lib/fatigue-reason";
import { FATIGUE_REASON_DISPLAY_META } from "@/lib/fatigue-reason-display";
import { resolveFatigueReasonTypeFromSlug } from "@/lib/fatigue-reason-share";

export const runtime = "edge";

function resolveType(value: string | null): FatigueReasonType {
  return resolveFatigueReasonTypeFromSlug(value) ?? "reset";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = resolveType(searchParams.get("result"));
  const meta = FATIGUE_REASON_DISPLAY_META[type];
  const guide = FATIGUE_REASON_ACTION_GUIDES[type];
  const suitedMeetings = guide.suitedMeetings.slice(0, 3);
  const drainingMeetings = guide.drainingMeetings.slice(0, 2);

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
            婚活疲れ・マチアプ疲れ診断
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
          <div style={pillStyle(ogPalette.green)}>{`あなたの婚活疲れの入口`}</div>

          <SoftCard style={{ padding: "28px 30px", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: ogPalette.accent, letterSpacing: "0.12em" }}>
              合いやすい出会い方
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {suitedMeetings.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    padding: "12px 16px",
                    borderRadius: 18,
                    background: hexToRgba(ogPalette.green, 0.1),
                    border: `1px solid ${hexToRgba(ogPalette.green, 0.18)}`,
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </SoftCard>

          <SoftCard style={{ padding: "28px 30px", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: ogPalette.accent, letterSpacing: "0.12em" }}>
              疲れやすい出会い方
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {drainingMeetings.map((item) => (
                <div key={item} style={{ display: "flex", fontSize: 24, fontWeight: 700, color: ogPalette.textMain }}>
                  {item}
                </div>
              ))}
            </div>
          </SoftCard>
        </div>
      </div>

      {renderFooter("shindanlab.jp/diagnoses/konkatsu-fatigue", "@yauyuism")}
    </div>
  );
}
