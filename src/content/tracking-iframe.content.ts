import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import {TRACKING_PARAMS} from "@/data/tracking-params";
import {FALSE_POSITIVE_EXCLUSION_LIST} from "@/data/false-positive-list";
import {TrackingMethod} from "@/types/tracking-enums";
import {addHotspotWithTooltip} from "@/ui/components/mark-tracking/add-hotspot-with-tooltip";

/* ---- Tracking Type: 
   IFrame Tracking – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedIframes = new Set<string>();

/* ---- Tracking Type: IFrames ---- */
export async function detectTrackingIframes() {
  const iframes = document.querySelectorAll<HTMLImageElement>("iframe");

  iframes.forEach((iframe) => {
    if (iframe.dataset.iframeAnalyzed) return;
    iframe.dataset.iframeAnalyzed = "true";

    const src = iframe.src;
    if (!src) return;

    // if whitelisted, skip
    if (FALSE_POSITIVE_EXCLUSION_LIST.some((domain) => src.includes(domain)))
      return;

    // check tracking domain lists
    const trackerInfo = TRACKING_DOMAINS.find((tracker) =>
      src.includes(tracker.domain)
    );
    if (!trackerInfo) return;

    // if already processed, skip, else add to src
    if (processedIframes.has(src)) return;
    processedIframes.add(src);

    // inform service worker
    chrome.runtime.sendMessage({
      type: "IFRAME_TRACKER_DETECTED",
      key: src,
    });
    console.log("[IFRAME]", processedIframes.size, src);

    // check if the iFrame URL contains tracking parameters
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
      console.warn("Invalid iframe URL, cannot parse:", e);
    }

    // display hotspot in the DOM
    const rect = iframe.getBoundingClientRect();

    addHotspotWithTooltip(
      src,
      rect.left + window.scrollX,
      rect.top + window.scrollY,
      trackingParams,
      TrackingMethod.IFRAME,
      null
    );

    // console.log(
    //   "[IFRAME]",
    //   processedIframes.size,
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
