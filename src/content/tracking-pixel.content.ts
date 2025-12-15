import {TRACKING_PARAMS} from "@/data/tracking-params";
import {FALSE_POSITIVE_EXCLUSION_LIST} from "@/data/false-positive-list";
import {TrackingMethod} from "@/types/tracking-enums";
import {addHotspotWithTooltip} from "@/ui/components/mark-tracking/add-hotspot-with-tooltip";

/* ---- Tracking Type: 
   Tracking Pixels – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedPixels = new Set<string>();

/* ---- Tracking Type: Pixels ---- */
export async function detectTrackingPixels() {
  const images = document.querySelectorAll<HTMLImageElement>("img");

  images.forEach((img) => {
    if (img.dataset.pixelAnalyzed) return;
    img.dataset.pixelAnalyzed = "true";

    const src = img.currentSrc || img.src;
    if (!src) return;

    // skip if whitelisted
    if (FALSE_POSITIVE_EXCLUSION_LIST.some((domain) => src.includes(domain)))
      return;

    if (!looksLikeTrackingPixel(src)) return;

    // if already processed, skip, else add to src
    if (processedPixels.has(src)) return;
    processedPixels.add(src);

    // inform service worker
    chrome.runtime.sendMessage({
      type: "PIXEL_TRACKER_DETECTED",
      key: src,
    });
    console.log("[PIXEL]", processedPixels.size, src);

    // check if the pixel URL contains tracking parameters
    const trackingParams: Record<string, string> = {};
    try {
      if (src.startsWith("http")) {
        const url = new URL(src);
        const params = url.searchParams;

        params.forEach((value, key) => {
          if (
            TRACKING_PARAMS.some((prefix) =>
              key.toLowerCase().startsWith(prefix)
            )
          ) {
            trackingParams[key] = value;
          }
        });
      }
    } catch (e) {
      console.warn("Invalid pixel URL, cannot parse:", e);
    }

    // display hotspot in the DOM
    const rect = img.getBoundingClientRect();

    addHotspotWithTooltip(
      src,
      rect.left + window.scrollX,
      rect.top + window.scrollY,
      trackingParams,
      TrackingMethod.PIXEL,
      null
    );

    // console.log(
    //   "[PIXEL]",
    //   processedPixels.size,
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

function looksLikeTrackingPixel(src: string): boolean {
  const lower = src.toLowerCase();

  return (
    lower.includes("pixel") ||
    lower.includes("track") ||
    lower.includes("impression") ||
    lower.includes("analytics") ||
    lower.startsWith("data:image")
  );
}
