declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isTrackingAvailable() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (!isTrackingAvailable()) {
    return;
  }

  const gtag = window.gtag;
  if (typeof gtag !== "function") {
    return;
  }

  gtag("event", eventName, params ?? {});
}

export function trackPageView(pagePath?: string) {
  if (!isTrackingAvailable()) {
    return;
  }

  const gtag = window.gtag;
  if (typeof gtag !== "function") {
    return;
  }

  gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: pagePath ?? `${window.location.pathname}${window.location.search}`,
  });
}
