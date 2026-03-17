import { ImageResponse } from "next/og";

import { getStatsSnapshot } from "@/lib/stats";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getStatsSnapshot();
  const topMistake = stats.badRanking[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F7 100%)",
          color: "#1A1A1A",
          fontFamily: "\"Hiragino Sans\", \"Yu Gothic\", sans-serif",
          padding: "54px 58px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-120px",
            top: "-120px",
            width: "380px",
            height: "380px",
            borderRadius: "999px",
            background: "radial-gradient(circle, rgba(232,69,60,0.14) 0%, rgba(232,69,60,0) 74%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-90px",
            bottom: "-100px",
            width: "360px",
            height: "360px",
            borderRadius: "999px",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0) 74%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: "36px",
            border: "1px solid rgba(26,26,26,0.08)",
            background: "rgba(255,255,255,0.82)",
            boxShadow: "0 24px 70px rgba(26,26,26,0.08)",
            padding: "38px 42px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                alignSelf: "flex-start",
                border: "1px solid rgba(232,69,60,0.16)",
                borderRadius: "999px",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.92)",
                color: "#E8453C",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.16em",
              }}
            >
              PROFILE STATS
            </div>

            <div style={{ fontSize: "54px", lineHeight: 1.3 }}>みんなのプロフ偏差値</div>
            <div style={{ fontSize: "28px", color: "#6B7280" }}>
              累計 {stats.totalCount.toLocaleString()} 人が診断済み
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: "10px",
                borderRadius: "28px",
                border: "1px solid rgba(26,26,26,0.08)",
                background: "rgba(255,255,255,0.88)",
                padding: "26px",
              }}
            >
              <div style={{ fontSize: "20px", letterSpacing: "0.12em", color: "#6B7280" }}>平均偏差値</div>
              <div style={{ display: "flex", gap: "24px", marginTop: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "18px", color: "#6B7280" }}>男性</div>
                  <div style={{ fontSize: "72px", lineHeight: 1, color: "#3B82F6", fontWeight: 800 }}>
                    {stats.avgHensachiByGender.male ?? "-"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "18px", color: "#6B7280" }}>女性</div>
                  <div style={{ fontSize: "72px", lineHeight: 1, color: "#E8453C", fontWeight: 800 }}>
                    {stats.avgHensachiByGender.female ?? "-"}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: "12px",
                borderRadius: "28px",
                border: "1px solid rgba(26,26,26,0.08)",
                background: "rgba(255,255,255,0.88)",
                padding: "26px",
              }}
            >
              <div style={{ fontSize: "20px", letterSpacing: "0.12em", color: "#6B7280" }}>最多ミス</div>
              <div style={{ fontSize: "42px", lineHeight: 1.35 }}>{topMistake?.category ?? "データ集計中"}</div>
              <div style={{ fontSize: "24px", color: "#6B7280" }}>
                {topMistake ? `${topMistake.count.toLocaleString()}件で最多` : "診断データを集計中"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "24px",
              color: "#9CA3AF",
            }}
          >
            <div>#プロフ偏差値</div>
            <div>@yauyuism</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
