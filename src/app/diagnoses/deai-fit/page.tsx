import { DeaiFitApp } from "@/components/deai-fit/DeaiFitApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "あなたに合う出会い方診断",
  description:
    "マチアプ、相談所、紹介、SNS、外飲み。オンライン・オフライン、条件・空気感、スピード感、人間関係の4軸から、あなたの恋愛が進みやすい出会い方を16タイプで診断します。",
  path: "/diagnoses/deai-fit",
  imagePath: "/api/og-top",
  imageAlt: "あなたに合う出会い方診断のOGP画像",
  absoluteTitle: true,
  ogTitle: "あなたに合う出会い方診断",
  ogDescription:
    "マチアプ、相談所、紹介、SNS、外飲み。オンライン・オフライン、条件・空気感、スピード感、人間関係の4軸から、あなたの恋愛が進みやすい出会い方を16タイプで診断します。",
  siteName: "診断ラボ",
});

export default function DeaiFitPage() {
  return <DeaiFitApp />;
}
