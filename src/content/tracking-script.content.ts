import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import {TRACKING_PARAMS} from "@/data/tracking-params";
import {FALSE_POSITIVE_EXCLUSION_LIST} from "@/data/false-positive-list";
import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {addHotspotWithTooltip} from "@/ui/components/mark-tracking/add-hotspot-with-tooltip";

/* ---- Tracking Type: 
   Script Tracking – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedScripts = new Set<string>();

/* ---- Tracking Type: Scripts ---- */
export async function detectTrackingScripts() {
  const scripts = document.querySelectorAll<HTMLScriptElement>("script[src]");

  scripts.forEach((script) => {
    if (script.dataset.scriptAnalyzed) return;
    script.dataset.scriptAnalyzed = "true";

    const src = script.src;
    if (!src) return;

    // if whitelisted, skip
    if (FALSE_POSITIVE_EXCLUSION_LIST.some((domain) => src.includes(domain)))
      return;

    // check tracking domain lists
    const trackerInfo = TRACKING_DOMAINS.find((tracker) => {
      try {
        const url = new URL(src);
        const hostname = url.hostname;
        return (
          hostname.includes(tracker.domain) || tracker.domain.includes(hostname)
        );
      } catch {
        return src.includes(tracker.domain);
      }
    });
    if (!trackerInfo) return;

    if (trackerInfo.purpose === TrackerPurpose.SOCIAL) return;

    // if already processed, skip, else add to src
    if (processedScripts.has(src)) return;
    processedScripts.add(src);

    // inform service worker
    chrome.runtime.sendMessage({
      type: "SCRIPT_TRACKER_DETECTED",
      key: src,
    });
    console.log("[SCRIPT]", processedScripts.size, src);

    // check if the script URL contains tracking parameters
    const trackingParams: Record<string, string> = {};
    try {
      const url = new URL(src);
      const params = url.searchParams;

      params.forEach((value, key) => {
        if (
          TRACKING_PARAMS.some((prefix) => key.toLowerCase().startsWith(prefix))
        ) {
          trackingParams[key] = value;
        }
      });
    } catch (e) {
      console.warn("Invalid script URL, cannot parse:", e);
    }

    // display hotspot in the DOM
    const rect = script.getBoundingClientRect();

    addHotspotWithTooltip(
      src,
      rect.left + window.scrollX,
      rect.top + window.scrollY,
      trackingParams,
      TrackingMethod.SCRIPT,
      null
    );

    // console.log(
    //   "[SCRIPT]",
    //   processedScripts.size,
    //   src,
    //   "Position:",
    //   rect.left,
    //   rect.top,
    //   "Size:",
    //   rect.width,
    //   rect.height
    // );
  });
}
