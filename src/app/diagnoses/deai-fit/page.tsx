import { DeaiFitApp } from "@/components/deai-fit/DeaiFitApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "自分に合う出会い方診断",
  description: "マッチングアプリ、結婚相談所、紹介、SNS、外飲み、趣味の場。あなたの恋愛スタイルに合う出会い方を診断します。",
  path: "/diagnoses/deai-fit",
  imagePath: "/api/og-top",
  imageAlt: "自分に合う出会い方診断のトップOGP画像",
  ogTitle: "自分に合う出会い方診断 | 婚活診断LAB by アイカタ",
  ogDescription: "10問で、あなたに合う出会い方と婚活の進め方を整理します。",
});

export default function DeaiFitPage() {
  return <DeaiFitApp />;
}
