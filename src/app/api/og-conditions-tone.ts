export type ConditionsOgTone = {
  key: "rare" | "tight" | "balanced" | "broad";
  accent: string;
  secondary: string;
  label: string;
  headline: string;
  body: string;
};

export function getConditionsOgTone(percentage: number): ConditionsOgTone {
  if (percentage < 0.1) {
    return {
      key: "rare",
      accent: "#DC2626",
      secondary: "#F97316",
      label: "かなり絞られる条件",
      headline: "かなりレア。",
      body: "理想ははっきりしているぶん、母数はかなり少ない。",
    };
  }

  if (percentage < 0.5) {
    return {
      key: "tight",
      accent: "#EA580C",
      secondary: "#F59E0B",
      label: "少なめの条件",
      headline: "少し厳しめ。",
      body: "1つの条件で母数が大きく動きやすい広さです。",
    };
  }

  if (percentage < 3) {
    return {
      key: "balanced",
      accent: "#2563EB",
      secondary: "#38BDF8",
      label: "現実的な広さ",
      headline: "まだ現実的。",
      body: "条件としては十分戦える広さが残っています。",
    };
  }

  return {
    key: "broad",
    accent: "#059669",
    secondary: "#34D399",
    label: "かなり広めの条件",
    headline: "かなり広い。",
    body: "母数はしっかりあるので、ここからは相性で選ぶ段階です。",
  };
}
