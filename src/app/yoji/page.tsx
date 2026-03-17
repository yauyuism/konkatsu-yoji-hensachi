import { DiagnosisApp } from "@/components/DiagnosisApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "あなたの婚活を四字熟語で表すと",
  description: "10の質問に答えるだけ。あなたの婚活の本質が、たった四文字に凝縮される診断です。",
  path: "/yoji",
  imagePath: "/api/og",
  imageAlt: "婚活四字熟語診断のトップOGP画像",
  robots: {
    index: false,
    follow: false,
  },
});

export default function YojiPage() {
  return <DiagnosisApp />;
}
