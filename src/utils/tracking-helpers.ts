import {IS_SOCIAL_DOMAIN} from "@/data/false-positive-list";
import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import {
  ADVERTISING_PARAMS,
  ANALYTICS_PARAMS,
  GENERAL_TRACKING_PARAMS,
  REDIRECTOR_PARAMS,
  SOCIAL_PARAMS,
  UTM_PARAMS,
} from "@/data/tracking-params";
import type {TrackerPurpose} from "@/types/tracking-enums";

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

/* ---- Tracking Type: Click Based HREF's 
-> helper functions for link detection ---- */
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

// check if hash fragment contains tracking params
export function hasHashParam(hash: string, params: string[]): boolean {
  if (hash.length <= 1) return false;
  const lowerHash = hash.toLowerCase();
  return params.some((p) => lowerHash.includes(p));
}

// check if domain is a social domain
export function isSocialDomain(hostname: string): boolean {
  return IS_SOCIAL_DOMAIN.some((d) => hostname.includes(d));
}

// function to find tracker domain and its purpose
export function findTrackerDomain(url: URL): TrackerPurpose | null {
  const trackerInfo = TRACKING_DOMAINS.find((t) => {
    const hostname = url.hostname;
    return (
      hostname === t.domain ||
      hostname.endsWith("." + t.domain) ||
      hostname.includes(t.domain)
    );
  });
  return trackerInfo?.purpose || null;
}

// function to check if any param matches from a given list
export function hasParamMatch(
  params: Record<string, string>,
  paramList: string[]
): boolean {
  return paramList.some((p) =>
    Object.keys(params).some((k) => k.toLowerCase().startsWith(p))
  );
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

// function that excludes navigation hashes
export function isInternalNavigation(
  url: URL,
  currentLocation: Location
): boolean {
  if (
    url.origin !== currentLocation.origin ||
    url.pathname !== currentLocation.pathname
  ) {
    return false;
  }

  if (!url.hash) return false;

  // Hash ohne = (z.B. #section statt #param=value)
  if (!url.hash.includes("=")) return true;

  // Hash hat =, könnte Tracking sein
  return false;
}
