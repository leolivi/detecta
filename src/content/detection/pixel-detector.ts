import {
  extractTrackingParams,
  notifyServiceWorker,
} from "@/utils/tracking-helpers";
import {FALSE_POSITIVE_EXCLUSION_LIST} from "@/data/false-positive-list";
import {TrackingMethod} from "@/types/tracking-enums";
import type {DetectionResult} from "@/types/detection-result";
import {TRACKING_PIXEL_KEYWORDS} from "@/data/tracking-params";

/* ---- Tracking Type: 
   Tracking Pixels – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedPixels = new Set<string>();

/* ---- Tracking Type: Pixels ---- */
export function detectTrackingPixels(): DetectionResult[] {
  const results: DetectionResult[] = [];
  const images = document.querySelectorAll<HTMLImageElement>("img");

  images.forEach((img) => {
    if (img.dataset.pixelAnalyzed) return;
    img.dataset.pixelAnalyzed = "true";

    const src = img.currentSrc || img.src;
    if (!src) return;

    // if false positive, skip
    if (FALSE_POSITIVE_EXCLUSION_LIST.some((d) => src.includes(d))) return;

    if (!looksLikeTrackingPixel(src)) return;

    // if already processed, skip, else add to src
    if (processedPixels.has(src)) return;
    processedPixels.add(src);

    // inform service worker
    notifyServiceWorker("PIXEL_TRACKER_DETECTED", src);

    results.push({
      element: img,
      url: src,
      method: TrackingMethod.PIXEL,
      purpose: null,
      params: extractTrackingParams(src),
    });
    console.log("[PIXEL]", processedPixels.size, src);
  });

  return results;
}

// helper fuction to detect pixels
function looksLikeTrackingPixel(src: string): boolean {
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

  return false;
}
