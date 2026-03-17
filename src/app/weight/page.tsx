import { WeightApp } from "@/components/weight/WeightApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "LINEメッセージ重量測定",
  description: "あなたのLINE、何kgある？ スクショやテキストを貼るだけで、メッセージの重さをkg単位で測る無料ツールです。",
  path: "/weight",
  imagePath: "/api/og-weight-top",
  imageAlt: "LINEメッセージ重量測定のトップOGP画像",
  ogDescription: "あなたのLINE、何kgある？ スクショやテキストを貼るだけで、メッセージの重さをkg単位で測ります。",
});

export default function WeightPage() {
  return <WeightApp />;
}
