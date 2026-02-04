import { detectAdvertisements } from "@/content/detection/ad-detector";
import {
  COOKIE_BANNER_KEYWORDS,
  IS_SOCIAL_DOMAIN,
  SAFE_DOMAINS,
} from "@/data/false-positive-list";
import {
  AD_KEYWORDS,
  ADVERTISING_PARAMS,
  ANALYTICS_PARAMS,
  GENERAL_TRACKING_PARAMS,
  REDIRECTOR_PARAMS,
  SOCIAL_PARAMS,
  TRACKING_PIXEL_KEYWORDS,
  UTM_PARAMS,
} from "@/data/tracking-params";
import type { DetectionResult } from "@/types/detection-result";

// ------------ General Helper Functions for Tracking Detection ------------ //
// function to notify service worker
export function notifyServiceWorker(type: string, key: string): void {
  try {
    if (!chrome.runtime?.id) {
      console.debug("Extension context invalidated - bitte Seite neu laden");
      return;
    }
    chrome.runtime.sendMessage({ type, key });
  } catch (e) {
    console.debug("Service Worker could not be notified", e);
  }
}

/* ---- Tracking Type: Click Based HREF's 
-> helper functions for link detection ---- */
// values that look like real tracking identifiers (not UI / feature flags)
export function looksLikeTrackingValue(value: string): boolean {
  if (!value) return false;

  // long & high-entropy ids
  if (value.length >= 20 && /[a-f0-9]{6,}/i.test(value)) {
    return true;
  }

  // multi-part identifiers (utm style)
  if (value.split("_").length >= 4) {
    return true;
  }

  // base64 / encoded blobs
  if (/^[A-Za-z0-9+/=]{20,}$/.test(value)) {
    return true;
  }

  return false;
}

// feature flags & rollout params are NOT tracking
const FEATURE_FLAG_PATTERNS = [
  /rollout/i,
  /experiment/i,
  /variant/i,
  /feature/i,
  /test/i,
  /v\d+/i,
];

// checks if a tracker comes with params
export function extractTrackingParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!url || url === "about:blank") return params;

  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const urlObj = new URL(url);
      urlObj.searchParams.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (FEATURE_FLAG_PATTERNS.some((r) => r.test(key))) {
          return;
        }
        const isKnownTrackingKey =
          UTM_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          ANALYTICS_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          SOCIAL_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          ADVERTISING_PARAMS.some((p) => lowerKey.startsWith(p)) ||
          GENERAL_TRACKING_PARAMS.some((p) => lowerKey.startsWith(p));

        // only accept if the value actually looks like tracking
        if (isKnownTrackingKey && looksLikeTrackingValue(value)) {
          params[key] = value;
        }
      });
    }
  } catch (e) {
    console.debug("Invalid URL, cannot parse:", e);
  }
  return params;
}

// ------------ Ad Tracking Detection Helper Functions ------------ //
export function isAdvertisement(iframe: HTMLIFrameElement): boolean {
  const src = iframe.src || "";
  const id = iframe.id || "";
  const title = iframe.title || "";

  const srcMatch = AD_KEYWORDS.some((kw) => src.includes(kw));
  const attrMatch =
    id.toLowerCase().includes("ad") || title.toLowerCase().includes("ad");
  const emptyButLikelyAd = (!src || src === "about:blank") && attrMatch;

  const basicAd = srcMatch || attrMatch || emptyButLikelyAd;

  // exclude cookie and consent banners (false positives)
  const isCookieBanner =
    COOKIE_BANNER_KEYWORDS.some((kw) => src.toLowerCase().includes(kw)) ||
    COOKIE_BANNER_KEYWORDS.some((kw) => id.toLowerCase().includes(kw)) ||
    COOKIE_BANNER_KEYWORDS.some((kw) => title.toLowerCase().includes(kw));

  return basicAd && !isCookieBanner;
}

export function redetectAdsByDomain(domain: string): DetectionResult[] {
  const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");

  iframes.forEach((iframe) => {
    const src = iframe.src || "";
    if (src.includes(domain)) {
      delete iframe.dataset.adAnalyzed;
    }
  });

  return detectAdvertisements();
}

// ------------ Link Tracking Detection Helper Functions ------------ //
// ignore same-site params unless explicit UTM-style tracking
export function shouldIgnoreSameSiteParams(
  url: URL,
  params: Record<string, string>,
): boolean {
  const isSameSite = url.hostname === window.location.hostname;

  if (!isSameSite) return false;

  // allow explicit campaign tracking
  return !Object.keys(params).some((k) =>
    UTM_PARAMS.some((p) => k.toLowerCase().startsWith(p)),
  );
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

// check if domain is a safe/trusted domain
export function isSafeDomain(hostname: string): boolean {
  return SAFE_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d));
}

// function to check if any param matches from a given list
export function hasParamMatch(
  params: Record<string, string>,
  paramList: string[],
): boolean {
  return paramList.some((p) =>
    Object.keys(params).some((k) => k.toLowerCase().startsWith(p)),
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
  currentLocation: Location,
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

// ------------ Pixel Tracking Detection Helper Functions ------------ //
// helper fuction to detect pixels
export function looksLikeTrackingPixel(src: string): boolean {
  const lower = src.toLowerCase();

  // exclude own domain
  if (lower.includes(window.location.hostname)) {
    return false;
  }

  //  exclude normal images with normal paths
  if (
    /\/(images?|img|assets|media)\/.*\.(png|jpg|jpeg|gif|svg|webp)$/i.test(src)
  ) {
    return false;
  }

  // prefix check
  if (TRACKING_PIXEL_KEYWORDS.prefix.some((p: string) => lower.startsWith(p))) {
    return true;
  }

  // keyword check
  if (TRACKING_PIXEL_KEYWORDS.includes.some((t: string) => lower.includes(t))) {
    return true;
  }

  // UUID / Hash / lange IDs
  if (src.length > 20 && /[a-f0-9]{8,}/i.test(src)) return true;

  // multiple segments / encoded blobs
  if (src.split("_").length > 3) return true;

  return false;
}
