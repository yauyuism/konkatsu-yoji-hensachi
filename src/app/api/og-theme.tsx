import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ImageResponse } from "next/og";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const ogPalette = {
  background: "#F8F7F4",
  card: "#FFFFFF",
  textMain: "#1A1A1A",
  textSub: "#6B7280",
  accent: "#E8453C",
  blue: "#3B82F6",
  green: "#10B981",
  orange: "#F97316",
  line: "#E5E7EB",
  gray: "#9CA3AF",
};

const ogHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
};

let ogFontsPromise:
  | Promise<
      Array<{
        name: string;
        data: ArrayBuffer;
        weight: 400 | 700 | 800;
        style: "normal";
      }>
    >
  | null = null;

async function loadFont(url: string) {
  const response = await fetch(url, {
    // Fonts are cacheable static assets; keep the request explicit for the Edge runtime.
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load OGP font: ${url}`);
  }
  return response.arrayBuffer();
}

export async function getOgFonts() {
  if (!ogFontsPromise) {
    ogFontsPromise = Promise.all([
      loadFont("https://cdn.jsdelivr.net/npm/@fontsource/zen-kaku-gothic-new@5.2.7/files/zen-kaku-gothic-new-japanese-400-normal.woff"),
      loadFont("https://cdn.jsdelivr.net/npm/@fontsource/zen-kaku-gothic-new@5.2.7/files/zen-kaku-gothic-new-japanese-700-normal.woff"),
      loadFont("https://cdn.jsdelivr.net/npm/@fontsource/outfit@5.2.8/files/outfit-latin-800-normal.woff"),
    ]).then(([zenRegular, zenBold, outfit]) => [
      { name: "Zen Kaku Gothic New", data: zenRegular, weight: 400 as const, style: "normal" as const },
      { name: "Zen Kaku Gothic New", data: zenBold, weight: 700 as const, style: "normal" as const },
      { name: "Outfit", data: outfit, weight: 800 as const, style: "normal" as const },
    ]);
  }

  return ogFontsPromise;
}

export async function createOgImage(element: ReactElement) {
  return new ImageResponse(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await getOgFonts(),
    headers: ogHeaders,
  });
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const chunk = normalized.length === 3
    ? normalized
        .split("")
        .map((value) => `${value}${value}`)
        .join("")
    : normalized;
  const parsed = Number.parseInt(chunk, 16);
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function pillStyle(color = ogPalette.accent): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    alignSelf: "flex-start",
    padding: "10px 18px",
    borderRadius: "999px",
    border: `1px solid ${hexToRgba(color, 0.18)}`,
    background: hexToRgba("#FFFFFF", 0.9),
    color,
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };
}

export function renderFooter(left: string, right = "@yauyuism") {
  return (
    <div
      style={{
        position: "absolute",
        left: 42,
        right: 42,
        bottom: 28,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "18px",
        color: ogPalette.gray,
      }}
    >
      <div style={{ display: "flex" }}>{left}</div>
      <div style={{ display: "flex" }}>{right}</div>
    </div>
  );
}

export function renderBackdrop(accent = ogPalette.accent, secondary = ogPalette.blue) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "linear-gradient(135deg, #F8F7F4 0%, #FFF6F0 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -110,
          bottom: -140,
          width: 430,
          height: 430,
          borderRadius: "50%",
          display: "flex",
          background: `radial-gradient(circle, ${hexToRgba(accent, 0.14)} 0%, transparent 72%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -50,
          top: -80,
          width: 260,
          height: 260,
          borderRadius: "50%",
          display: "flex",
          background: `radial-gradient(circle, ${hexToRgba(secondary, 0.1)} 0%, transparent 72%)`,
        }}
      />
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
        }}
      >
        <defs>
          <pattern id="og-dots" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={hexToRgba("#1A1A1A", 0.07)} />
          </pattern>
        </defs>
        <rect x="0" y="0" width="1200" height="630" fill="url(#og-dots)" />
        <path d="M-40 600 L320 240" stroke={hexToRgba(accent, 0.06)} strokeWidth="2" />
        <path d="M180 680 L540 320" stroke={hexToRgba(accent, 0.05)} strokeWidth="2" />
        <path d="M780 -40 L1100 280" stroke={hexToRgba(secondary, 0.06)} strokeWidth="2" />
      </svg>
    </>
  );
}

export function SoftCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 34,
        border: `1px solid ${hexToRgba(ogPalette.textMain, 0.08)}`,
        background: hexToRgba("#FFFFFF", 0.86),
        boxShadow: "0 24px 60px rgba(26,26,26,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function scoreColor(score: number) {
  if (score >= 70) {
    return ogPalette.accent;
  }
  if (score >= 50) {
    return ogPalette.blue;
  }
  return ogPalette.gray;
}
