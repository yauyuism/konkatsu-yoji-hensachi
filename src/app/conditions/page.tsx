import { ConditionsApp } from "@/components/conditions/ConditionsApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "条件リアリティチェック",
  description: "あなたの“普通”は、日本に何人いる？ 条件を入れるだけで、未婚者全体の割合と人数を返す無料ツールです。",
  path: "/conditions",
  imagePath: "/api/og-conditions-top",
  imageAlt: "条件リアリティチェックのトップOGP画像",
  ogDescription: "あなたの“普通”は、日本に何人いる？ 条件を入れるだけで、未婚者全体の割合と人数を返します。",
});

export default function ConditionsPage() {
  return <ConditionsApp />;
}
