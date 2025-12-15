import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import {FALSE_POSITIVE_EXCLUSION_LIST} from "@/data/false-positive-list";
import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {addHotspotWithTooltip} from "@/ui/components/mark-tracking/add-hotspot-with-tooltip";

/* ---- Tracking Type: 
   Social Media Widget Tracking – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedWidgets = new Set<string>();

/* ---- Tracking Type: SOCIAL MEDIA Widget ---- */
export async function detectTrackingSocialWidgets() {
  const widgets = document.querySelectorAll<HTMLElement>(
    'div[class*="fb-"], div[class*="twitter-"], div[id*="fb-root"], a[class*="share"]'
  );

  widgets.forEach((widget) => {
    if (widget.dataset.widgetAnalyzed) return;
    widget.dataset.widgetAnalyzed = "true";

    // check if iframe is within the widget
    const iframe = widget.querySelector("iframe");
    const src = iframe?.src || "";

    if (src) {
      // if whitelisted, skip
      if (FALSE_POSITIVE_EXCLUSION_LIST.some((d) => src.includes(d))) return;

      const trackerInfo = TRACKING_DOMAINS.find((t) => src.includes(t.domain));
      if (trackerInfo?.purpose !== TrackerPurpose.SOCIAL) return;
    }

    const key =
      src ||
      `Social widget: ${widget.tagName}.${widget.className || widget.id}`;

    // if already processed, skip, else add to src
    if (processedWidgets.has(key)) return;
    processedWidgets.add(key);

    // inform service worker
    chrome.runtime.sendMessage({
      type: "WIDGET_TRACKER_DETECTED",
      key: key,
    });
    console.log("[SOME WIDGET]", processedWidgets.size, key);

    // display hotspot in the DOM
    const rect = widget.getBoundingClientRect();

    addHotspotWithTooltip(
      src,
      rect.left + window.scrollX,
      rect.top + window.scrollY,
      {},
      TrackingMethod.WIDGET,
      TrackerPurpose.SOCIAL
    );

    // console.log(
    //   "[SOME WIDGET]",
    //   processedWidgets.size,
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
