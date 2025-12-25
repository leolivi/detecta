import type {DetectionResult} from "@/types/detection-result";
import {addHotspotWithTooltip} from "@/ui/components/tooltip/add-hotspot-with-tooltip";
import {addLinkHoverEffect} from "./add-link-hover-effect";

export function markTracking(results: DetectionResult[]): void {
  results.forEach((result) => {
    const {element, url, method, purpose, params} = result;

    // links get hover effects
    if (element instanceof HTMLAnchorElement) {
      addLinkHoverEffect(element, method, purpose);
      return;
    }

    // ad iframes get outline + hover effect
    if (
      element instanceof HTMLIFrameElement &&
      element.dataset.trackerType === "ad"
    ) {
      element.style.outline = "3px solid red";
      element.style.outlineOffset = "-3px";
      element.className += "detecta-ad-iframe";

      /* BROWSER RESTRICTION: Custom cursors and JS hover events on <iframe> do not work in Chrome because the cursor and hover state are controlled by the iframe's content document.
      This is especially true for cross-origin or sandboxed iframes (e.g., most ads).
      The outline still works, but the cursor cannot be reliably changed via JS or CSS on the iframe element itself. */
      addLinkHoverEffect(element, method, purpose);

      return;
    }

    // Everything else gets hotspot
    const rect = element.getBoundingClientRect();
    addHotspotWithTooltip(
      url,
      rect.left + window.scrollX,
      rect.top + window.scrollY,
      params,
      method!,
      purpose
    );
  });
}
