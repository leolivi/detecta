import { FALSE_POSITIVE_EXCLUSION_LIST } from "@/data/false-positive-list";
import type { DetectionResult } from "@/types/detection-result";
import { TrackingMethod } from "@/types/tracking-enums";
import {
  extractTrackingParams,
  looksLikeTrackingPixel,
  notifyServiceWorker,
} from "@/utils/tracking-helpers";

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
