import {
  ADVERTISING_PARAMS,
  ANALYTICS_PARAMS,
  GENERAL_TRACKING_PARAMS,
  REDIRECTOR_PARAMS,
  SOCIAL_PARAMS,
  UTM_PARAMS,
} from "@/data/tracking-params";

// checks if a tracker comes with params
export function extractTrackingParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!url || url === "about:blank") return params;

  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const urlObj = new URL(url);
      urlObj.searchParams.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (
          UTM_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          ANALYTICS_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          SOCIAL_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          ADVERTISING_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          GENERAL_TRACKING_PARAMS.some((p) => lowerKey.startsWith(p))
        ) {
          params[key] = value;
        }
      });
    }
  } catch (e) {
    console.debug("Invalid URL, cannot parse:", e);
  }
  return params;
}

// function to notify service worker
export function notifyServiceWorker(type: string, key: string): void {
  try {
    if (!chrome.runtime?.id) {
      console.debug("Extension context invalidated - bitte Seite neu laden");
      return;
    }
    chrome.runtime.sendMessage({type, key});
  } catch (e) {
    console.debug("Service Worker could not be notified", e);
  }
}

// function to check if a URL is a redirector URL
export function isRedirectURL(url: URL) {
  for (const [key, value] of url.searchParams.entries()) {
    const k = key.toLowerCase();

    // clear redirect param
    if (REDIRECTOR_PARAMS.includes(k)) return true;

    // target url as a param
    if (/^https?:\/\//i.test(value)) return true;
  }
  return false;
}
