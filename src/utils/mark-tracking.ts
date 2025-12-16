import type {DetectionResult} from "@/types/detection-result";
import {TrackerPurpose} from "@/types/tracking-enums";
import {addHotspotWithTooltip} from "@/ui/components/mark-tracking/add-hotspot-with-tooltip";
import {
  addLinkHoverEffect,
  wrapIframeForHover,
} from "../ui/add-link-hover-effect";

export function markTracking(results: DetectionResult[]): void {
  results.forEach((result) => {
    const {element, url, method, purpose, params} = result;

    // links get hover effects
    if (element instanceof HTMLAnchorElement) {
      addLinkHoverEffect(element, method, purpose);
      return;
    }

    // ad iframes get outline + hover effect
    if (element instanceof HTMLIFrameElement && purpose === TrackerPurpose.AD) {
      element.style.outline = "3px solid red";
      element.style.outlineOffset = "-3px";

      const wrapper = wrapIframeForHover(element);
      addLinkHoverEffect(wrapper, method, purpose);
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
