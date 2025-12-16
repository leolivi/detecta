import {
  extractTrackingParams,
  notifyServiceWorker,
} from "@/utils/tracking-helpers";
import {FALSE_POSITIVE_EXCLUSION_LIST} from "@/data/false-positive-list";
import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import type {DetectionResult} from "@/types/detection-result";

/* ---- Tracking Type: 
   Script Tracking – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedScripts = new Set<string>();

/* ---- Tracking Type: Scripts ---- */
export function detectTrackingScripts(): DetectionResult[] {
  const results: DetectionResult[] = [];
  const scripts = document.querySelectorAll<HTMLScriptElement>("script[src]");

  scripts.forEach((script) => {
    if (script.dataset.scriptAnalyzed) return;
    script.dataset.scriptAnalyzed = "true";

    const src = script.src;
    if (!src) return;

    // if false positive, skip
    if (FALSE_POSITIVE_EXCLUSION_LIST.some((d) => src.includes(d))) return;

    // check tracking domain lists
    const trackerInfo = TRACKING_DOMAINS.find((t) => {
      try {
        const url = new URL(src);
        return (
          url.hostname.includes(t.domain) || t.domain.includes(url.hostname)
        );
      } catch {
        return src.includes(t.domain);
      }
    });

    if (!trackerInfo || trackerInfo.purpose === TrackerPurpose.SOCIAL) return;

    // if already processed, skip, else add to src
    if (processedScripts.has(src)) return;
    processedScripts.add(src);

    // inform service worker
    notifyServiceWorker("SCRIPT_TRACKER_DETECTED", src);

    results.push({
      element: script,
      url: src,
      method: TrackingMethod.SCRIPT,
      purpose: trackerInfo.purpose,
      params: extractTrackingParams(src),
    });
    console.log("[SCRIPT]", processedScripts.size, src);
  });

  return results;
}
