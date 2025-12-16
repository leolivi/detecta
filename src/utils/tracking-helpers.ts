import {TRACKING_PARAMS} from "@/data/tracking-params";

// checks if a tracker comes with params
export function extractTrackingParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!url || url === "about:blank") return params;

  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const urlObj = new URL(url);
      urlObj.searchParams.forEach((value, key) => {
        if (TRACKING_PARAMS.some((p) => key.toLowerCase().startsWith(p))) {
          params[key] = value;
        }
      });
    }
  } catch (e) {
    console.warn("Invalid URL, cannot parse:", e);
  }
  return params;
}

// function to notify service worker
export function notifyServiceWorker(type: string, key: string): void {
  try {
    chrome.runtime.sendMessage({type, key});
  } catch (e) {
    console.warn("Service Worker could not be notified", e);
  }
}
