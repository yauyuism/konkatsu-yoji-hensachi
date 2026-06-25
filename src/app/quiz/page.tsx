import { DiagnosisApp } from "@/components/DiagnosisApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "診断スタート",
  description: "10問の質問に答えて、あなたの婚活を四字熟語で診断します。",
  path: "/quiz",
  imagePath: "/api/og",
  imageAlt: "婚活四字熟語診断のスタートページOGP画像",
  ogTitle: "婚活四字熟語診断を始める | 婚活診断LAB by やうゆ",
  ogDescription: "10問の質問に答えるだけ。あなたの婚活の本質が、たった四文字に凝縮される診断のスタートページです。",
  robots: {
    index: false,
    follow: false,
  },
});

export default function QuizPage() {
  return <DiagnosisApp initialStage="question" />;
}
