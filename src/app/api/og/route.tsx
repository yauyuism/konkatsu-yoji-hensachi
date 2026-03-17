import { ImageResponse } from "next/og";

import { rarityLabels, results } from "@/data/results";
import { isResultType } from "@/lib/diagnosis";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type")?.toLowerCase();
  const result = type && isResultType(type) ? results[type] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          color: "#1A1A1A",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F7 100%)",
          padding: "48px 58px",
          fontFamily: "\"Hiragino Sans\", \"Yu Gothic\", sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            left: "-120px",
            top: "-110px",
            borderRadius: "999px",
            background: "radial-gradient(circle, rgba(232,69,60,0.16) 0%, rgba(232,69,60,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "380px",
            height: "380px",
            right: "-70px",
            bottom: "-120px",
            borderRadius: "999px",
            background: "radial-gradient(circle, rgba(249,115,22,0.14) 0%, rgba(249,115,22,0) 72%)",
          }}
        />

        <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
          <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                alignSelf: "flex-start",
                display: "flex",
                border: "1px solid rgba(232,69,60,0.16)",
                borderRadius: "999px",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.88)",
                color: "#E8453C",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.16em",
              }}
            >
              KONKATSU YOJI
            </div>

            <div style={{ marginTop: "34px", fontSize: "28px", color: "#6B7280" }}>あなたの婚活を四字熟語で表すと</div>

            {result ? (
              <>
                <div
                  style={{
                    marginTop: "28px",
                    alignSelf: "flex-start",
                    display: "flex",
                    borderRadius: "999px",
                    border: "1px solid rgba(232,69,60,0.14)",
                    background: "linear-gradient(135deg, rgba(232,69,60,0.12), rgba(249,115,22,0.12))",
                    color: "#E8453C",
                    padding: "10px 20px",
                    fontSize: "22px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  {rarityLabels[result.rarity]}
                </div>

                <div
                  style={{
                    marginTop: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "34px",
                    border: "1px solid rgba(26,26,26,0.08)",
                    background: "rgba(255,255,255,0.78)",
                    boxShadow: "0 24px 70px rgba(26,26,26,0.08)",
                    width: "100%",
                    height: "270px",
                    fontSize: "116px",
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                  }}
                >
                  {result.yoji}
                </div>

                <div style={{ marginTop: "20px", fontSize: "32px", color: "#6B7280", letterSpacing: "0.12em" }}>
                  {result.reading}
                </div>
              </>
            ) : (
              <>
                <div style={{ marginTop: "34px", fontSize: "98px", fontWeight: 800, lineHeight: 1.15 }}>
                  婚活四字熟語診断
                </div>
                <div style={{ marginTop: "22px", fontSize: "34px", lineHeight: 1.5, color: "#6B7280" }}>
                  10の質問に答えるだけ。あなたの婚活の本質が、たった四文字に。
                </div>
              </>
            )}

            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "24px", color: "#9CA3AF" }}>#婚活四字熟語</div>
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div style={{ fontSize: "22px", color: "#6B7280" }}>@yauyuism</div>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    border: "3px solid #E8453C",
                    borderRadius: "18px",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#E8453C",
                    fontSize: "20px",
                    fontWeight: 700,
                    background: "rgba(255,245,245,0.92)",
                  }}
                >
                  やうゆ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
