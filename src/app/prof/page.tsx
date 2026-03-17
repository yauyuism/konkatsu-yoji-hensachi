import { Suspense } from "react";

import { ProfApp } from "@/components/prof/ProfApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "マッチングアプリのプロフィール偏差値診断",
  description: "あなたのプロフ、異性からどう見えてる？ プロフィール文を貼るだけで、AIが5軸の偏差値と改善案を返す無料診断です。",
  path: "/prof",
  imagePath: "/api/og-prof-top",
  imageAlt: "プロフィール偏差値診断のトップOGP画像",
  ogDescription: "あなたのプロフ、異性からどう見えてる？ プロフィール文を貼るだけで、AIが5軸の偏差値と改善案を返します。",
});

export default function ProfPage() {
  return (
    <Suspense fallback={null}>
      <ProfApp />
    </Suspense>
  );
}
