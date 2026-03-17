import { createOgImage, hexToRgba, ogPalette, pillStyle, renderBackdrop, renderFooter, SoftCard } from "../og-theme";
import { TYPES } from "@/data/type-results";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") || "SMLA").toUpperCase();
  const se = Number(searchParams.get("se") || 50);
  const mt = Number(searchParams.get("mt") || 50);
  const lf = Number(searchParams.get("lf") || 50);
  const ap = Number(searchParams.get("ap") || 50);
  const type = TYPES[(code in TYPES ? code : "SMLA") as keyof typeof TYPES];
  const color = type.color;

  const axes = [
    { left: "S", right: "E", pct: se, label: "量↔質" },
    { left: "M", right: "T", pct: mt, label: "文字↔会う" },
    { left: "L", right: "F", pct: lf, label: "条件↔直感" },
    { left: "A", right: "P", pct: ap, label: "攻め↔待ち" },
  ];

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
      {renderBackdrop(color, ogPalette.blue)}

      <div
        style={{
          position: "absolute",
          left: -80,
          top: -60,
          width: 500,
          height: 500,
          borderRadius: "50%",
          display: "flex",
          background: `radial-gradient(circle, ${hexToRgba(color, 0.12)} 0%, transparent 72%)`,
        }}
      />

      <div style={{ position: "absolute", left: 42, top: 34, display: "flex" }}>
        <div style={pillStyle()}>{`MATCHING APP TYPE`}</div>
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 62px 78px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "34%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: 42,
              background: `linear-gradient(135deg, ${color} 0%, ${hexToRgba(color, 0.88)} 100%)`,
              boxShadow: `0 20px 56px ${hexToRgba(color, 0.26)}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 22 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF", display: "flex" }} />
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF", display: "flex" }} />
            </div>
            <div style={{ display: "flex", fontSize: 42, color: "#FFFFFF", fontWeight: 700 }}>{type.emoji}</div>
          </div>
        </div>

        <div
          style={{
            width: "60%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <SoftCard style={{ width: 620, padding: "34px 34px 30px", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 66, fontWeight: 800, lineHeight: 1, color, fontFamily: "Outfit", letterSpacing: "0.12em" }}>
              {code}
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: ogPalette.textMain }}>{type.name}</div>
            <div style={{ display: "flex", fontSize: 20, lineHeight: 1.6, color: ogPalette.textSub }}>{type.catchphrase}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
              {axes.map((axis) => (
                <div key={axis.left} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", width: 24, fontSize: 18, fontWeight: 700, color: ogPalette.textMain, fontFamily: "Outfit" }}>{axis.left}</div>
                  <div
                    style={{
                      flex: 1,
                      height: 16,
                      borderRadius: 999,
                      background: "#E9EDF4",
                      display: "flex",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: `${Math.max(0, Math.min(100, axis.pct))}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: color,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", width: 24, fontSize: 18, fontWeight: 700, color: ogPalette.textMain, fontFamily: "Outfit" }}>{axis.right}</div>
                  <div style={{ display: "flex", width: 46, fontSize: 16, color: ogPalette.gray, fontFamily: "Outfit" }}>{`${axis.pct}%`}</div>
                </div>
              ))}
            </div>
          </SoftCard>
        </div>
      </div>

      {renderFooter("#マチアプMBTI")}
    </div>
  );
}
