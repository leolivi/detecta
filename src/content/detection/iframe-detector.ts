import { FALSE_POSITIVE_EXCLUSION_LIST } from "@/data/false-positive-list";
import type { DetectionResult } from "@/types/detection-result";
import { TrackingMethod } from "@/types/tracking-enums";
import {
  extractTrackingParams,
  notifyServiceWorker,
} from "@/utils/tracking-helpers";
import { findTrackerByUrl } from "@/utils/tracking-url";

/* ---- Tracking Type: 
   IFrame Tracking – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedIframes = new Set<string>();

/* ---- Tracking Type: IFrames ---- */
export function detectTrackingIframes(): DetectionResult[] {
  const results: DetectionResult[] = [];
  const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");

  iframes.forEach((iframe) => {
    if (iframe.dataset.iframeAnalyzed) return;
    iframe.dataset.iframeAnalyzed = "true";

    if (iframe.dataset.adAnalyzed) return;

    const src = iframe.src;
    if (!src) return;

    // if false positive, skip
    if (FALSE_POSITIVE_EXCLUSION_LIST.some((d) => src.includes(d))) return;

    // check tracking domain lists
    const trackerInfo = findTrackerByUrl(src);
    if (!trackerInfo) return;

    // if already processed, skip, else add to src
    if (processedIframes.has(src)) return;
    processedIframes.add(src);

    // inform service worker
    notifyServiceWorker("IFRAME_TRACKER_DETECTED", src);

    results.push({
      element: iframe,
      url: src,
      method: TrackingMethod.IFRAME,
      purpose: trackerInfo.purpose,
      params: extractTrackingParams(src),
    });
    console.log("[IFRAME]", processedIframes.size, src);
  });

  return results;
}
