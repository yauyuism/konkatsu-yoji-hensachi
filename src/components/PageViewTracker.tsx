"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { trackPageView } from "@/lib/analytics";

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const search = searchParams.toString();
    const pagePath = search ? `${pathname}?${search}` : pathname;

    if (lastPathRef.current === pagePath) {
      return;
    }

    lastPathRef.current = pagePath;
    trackPageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}
