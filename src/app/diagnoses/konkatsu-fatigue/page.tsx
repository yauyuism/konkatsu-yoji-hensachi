import { FatigueReasonApp } from "@/components/fatigue-reason/FatigueReasonApp";
import { buildShareMetadata } from "@/lib/metadata";

const title = "婚活疲れ・マチアプ疲れの理由診断";
const description =
  "会えるのに進まない理由を、婚活相談の現場でよく出る悩みからタイプ別に診断します。マチアプ疲れ、婚活疲れ、相談所前の迷いを一度整理したい人へ。";

export const metadata = buildShareMetadata({
  title,
  description,
  path: "/diagnoses/konkatsu-fatigue",
  imagePath: "/api/og-top",
  imageAlt: "婚活疲れ・マチアプ疲れの理由診断のOGP画像",
  ogTitle: title,
  ogDescription: description,
});

export default function KonkatsuFatiguePage() {
  return <FatigueReasonApp />;
}
