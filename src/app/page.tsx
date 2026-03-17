import { cookies } from "next/headers";

import { HomePageClient } from "@/components/home/HomePageClient";
import { COMPLETED_TOOLS_COOKIE } from "@/lib/completed-tools-keys";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "SHINDAN LAB",
  description: "診断で、自分を丸裸にする。恋愛や婚活を感覚ではなく数字で見直すための診断ラボです。",
  path: "/",
  imagePath: "/api/og-top",
  imageAlt: "SHINDAN LABのトップページOGP画像",
  ogTitle: "SHINDAN LAB | 診断で、自分を丸裸にする。",
  ogDescription: "恋愛や婚活を感覚ではなく数字で見直すための診断ラボ。偏差値、人数、レア度、重さをまとめて返します。",
});

export default async function HomePage() {
  const cookieStore = await cookies();

  return <HomePageClient initialHasCompletedAnyTool={cookieStore.has(COMPLETED_TOOLS_COOKIE)} />;
}
