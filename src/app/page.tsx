import { cookies } from "next/headers";

import { HomePageClient } from "@/components/home/HomePageClient";
import { COMPLETED_TOOLS_COOKIE } from "@/lib/completed-tools-keys";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "婚活診断LAB by アイカタ",
  description: "婚活・恋愛の癖を知る無料診断メディア。自分に合わない頑張り方を見直し、自分に合う出会い方を知るための入口です。",
  path: "/",
  imagePath: "/api/og-top",
  imageAlt: "婚活診断LAB by アイカタのトップページOGP画像",
  ogTitle: "婚活診断LAB by アイカタ | 婚活・恋愛の癖を知る無料診断メディア",
  ogDescription: "出会い方、理想の高さ、LINEの距離感、プロフィールの見せ方を診断し、自分に合う婚活の進め方を見つける入口です。",
});

export default async function HomePage() {
  const cookieStore = await cookies();

  return <HomePageClient initialHasCompletedAnyTool={cookieStore.has(COMPLETED_TOOLS_COOKIE)} />;
}
