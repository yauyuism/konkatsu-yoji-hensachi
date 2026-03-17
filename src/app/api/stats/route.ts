import { NextResponse } from "next/server";

import { getStatsSnapshot } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getStatsSnapshot();

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
