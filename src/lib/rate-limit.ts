import { kv } from "@vercel/kv";

const WINDOW_SECONDS = 60 * 60;
export const ANALYZE_HOURLY_LIMIT = 10;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  limit: number;
};

type DailyCapResult = {
  allowed: boolean;
  remaining: number | null;
  max: number | null;
};

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function resolveIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "anonymous";
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("fly-client-ip") ??
    "anonymous"
  );
}

export async function checkScopedHourlyRateLimit(
  request: Request,
  scope: string,
  limit = ANALYZE_HOURLY_LIMIT
): Promise<RateLimitResult> {
  if (!isKvConfigured()) {
    return {
      allowed: true,
      remaining: limit,
      resetSeconds: WINDOW_SECONDS,
      limit,
    };
  }

  try {
    const ip = resolveIp(request);
    const key = `rate:${scope}:${ip}`;
    const count = await kv.incr(key);

    if (count === 1) {
      await kv.expire(key, WINDOW_SECONDS);
    }

    const ttl = await kv.ttl(key);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetSeconds: ttl > 0 ? ttl : WINDOW_SECONDS,
      limit,
    };
  } catch {
    return {
      allowed: true,
      remaining: limit,
      resetSeconds: WINDOW_SECONDS,
      limit,
    };
  }
}

export async function checkHourlyRateLimit(request: Request, limit = ANALYZE_HOURLY_LIMIT): Promise<RateLimitResult> {
  return checkScopedHourlyRateLimit(request, "analyze", limit);
}

export async function checkDailyRequestCap(): Promise<DailyCapResult> {
  const maxRaw = Number(process.env.MAX_DAILY_REQUESTS);
  if (!Number.isFinite(maxRaw) || maxRaw <= 0 || !isKvConfigured()) {
    return {
      allowed: true,
      remaining: null,
      max: null,
    };
  }

  const max = Math.floor(maxRaw);
  const dateKey = new Date().toISOString().slice(0, 10);
  const key = `rate:daily:${dateKey}`;

  try {
    const count = await kv.incr(key);

    if (count === 1) {
      await kv.expire(key, 60 * 60 * 48);
    }

    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      max,
    };
  } catch {
    return {
      allowed: true,
      remaining: max,
      max,
    };
  }
}
