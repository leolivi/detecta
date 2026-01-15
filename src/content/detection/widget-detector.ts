import {FALSE_POSITIVE_EXCLUSION_LIST} from "@/data/false-positive-list";
import {notifyServiceWorker} from "@/utils/tracking-helpers";
import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import type {DetectionResult} from "@/types/detection-result";

/* ---- Tracking Type: 
   Social Media Widget Tracking – THIRD PARTY COMPONENTS
---- */

// prevents double events
const processedWidgets = new Set<string>();

/* ---- Tracking Type: SOCIAL MEDIA Widget ---- */
export function detectTrackingWidgets(): DetectionResult[] {
  const results: DetectionResult[] = [];
  const widgets = document.querySelectorAll<HTMLElement>(
    'div[class*="fb-"], div[class*="twitter-"], div[class*="pinterest-"], div[class*="linkedin-"], div[class*="instagram-"], div[id*="fb-root"], a[class*="share"], div[data-pin-do]'
  );

  widgets.forEach((widget) => {
    if (widget.dataset.widgetAnalyzed) return;
    widget.dataset.widgetAnalyzed = "true";

    // check if iframe is within the widget
    const iframe = widget.querySelector("iframe");
    const src = iframe?.src || "";

    // skip if already detected as an iframe
    if (iframe?.dataset.iframeAnalyzed === "true") {
      return;
    }

    if (src) {
      // if false positive, skip
      if (FALSE_POSITIVE_EXCLUSION_LIST.some((d) => src.includes(d))) return;
      const trackerInfo = TRACKING_DOMAINS.find((t) => src.includes(t.domain));
      if (trackerInfo?.purpose !== TrackerPurpose.SOCIAL) return;
    }

    const key =
      src || `widget-${widget.tagName}.${widget.className || widget.id}`;

    // if already processed, skip, else add to src
    if (processedWidgets.has(key)) return;
    processedWidgets.add(key);

    // inform service worker
    notifyServiceWorker("WIDGET_TRACKER_DETECTED", key);

    results.push({
      element: widget,
      url: src,
      method: TrackingMethod.WIDGET,
      purpose: TrackerPurpose.SOCIAL,
      params: {},
    });
    console.log("[SOME WIDGET]", processedWidgets.size, key);
  });

  return results;
}
