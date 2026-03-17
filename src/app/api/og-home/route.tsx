import { GET as getTopOg } from "../og-top/route";

export const runtime = "edge";

export async function GET() {
  return getTopOg();
}
