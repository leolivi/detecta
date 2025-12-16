import {AD_KEYWORDS} from "@/data/tracking-params";
import type {DetectionResult} from "@/types/detection-result";
import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {
  extractTrackingParams,
  notifyServiceWorker,
} from "@/utils/tracking-helpers";

/* ---- Tracking Type: 
  Click Based Ad Tracking 
---- */

// prevents double events
const processedAds = new Set<string>();

/* ---- Tracking Type: Click Based iFrames ---- */
export function detectAdvertisements(): DetectionResult[] {
  const results: DetectionResult[] = [];
  const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");

  iframes.forEach((iframe) => {
    if (iframe.dataset.adAnalyzed) return;
    iframe.dataset.adAnalyzed = "true";

    // check if iframe is an AD
    if (!isAdvertisement(iframe)) return;

    const rect = iframe.getBoundingClientRect();
    if (rect.width <= 50 || rect.height <= 50) return;

    const key = iframe.src || `ad-${iframe.id || Math.random()}`;

    // skip if already processed
    if (processedAds.has(key)) return;
    processedAds.add(key);

    iframe.dataset.trackerType = "ad";

    // inform service worker
    notifyServiceWorker("AD_TRACKER_DETECTED", key);

    results.push({
      element: iframe,
      url: iframe.src,
      method: TrackingMethod.IFRAME,
      purpose: TrackerPurpose.AD,
      params: extractTrackingParams(iframe.src),
    });
  });

  return results;
}

function isAdvertisement(iframe: HTMLIFrameElement): boolean {
  const src = iframe.src || "";
  const id = iframe.id || "";
  const title = iframe.title || "";

  const srcMatch = AD_KEYWORDS.some((kw) => src.includes(kw));
  const attrMatch =
    id.toLowerCase().includes("ad") || title.toLowerCase().includes("ad");
  const emptyButLikelyAd = (!src || src === "about:blank") && attrMatch;

  return srcMatch || attrMatch || emptyButLikelyAd;
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
