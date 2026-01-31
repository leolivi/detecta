import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import type {CursorIconType} from "@/types/cursor";
import {showCursorIcon, hideCursorIcon} from "./cursor-follower";

export function addLinkHoverEffect(
  element: HTMLElement,
  method: TrackingMethod | null,
  purpose: TrackerPurpose | null
) {
  const iconType = resolveCursorIcon(method, purpose);

  element.addEventListener("mouseenter", () => {
    showCursorIcon(iconType);
  });

  element.addEventListener("mouseleave", () => {
    hideCursorIcon();
  });
}

export function resolveCursorIcon(
  method: TrackingMethod | null,
  purpose: TrackerPurpose | null
): CursorIconType {
  if (method) {
    switch (method) {
      case TrackingMethod.AFFILIATE:
        return "AFFILIATE";
      case TrackingMethod.SHORTENER:
        return "SHORTENER";
      case TrackingMethod.REDIRECTOR:
        return "REDIRECTOR";
      case TrackingMethod.URL_DECORATION:
        return "URL_DECORATION";
    }
  }

  switch (purpose) {
    case TrackerPurpose.AD:
      return "AD";
    case TrackerPurpose.ANALYTICS:
      return "ANALYTICS";
    case TrackerPurpose.SOCIAL:
      return "SOCIAL";
    default:
      return "UNKNOWN";
  }
}
