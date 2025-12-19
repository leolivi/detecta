import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {changeCursor} from "./change-cursor";
import {CursorStyles} from "@/types/cursor";

// function add hover effect to tracked links
export function addLinkHoverEffect(
  element: HTMLElement,
  method: TrackingMethod | null,
  purpose: TrackerPurpose | null
) {
  const cursorStyle = resolveCursorStyle(method, purpose);

  element.addEventListener("mouseenter", () => {
    changeCursor(element, cursorStyle, method);
  });

  element.addEventListener("mouseleave", () => {
    changeCursor(element, CursorStyles.NORMAL, null);
  });
}

export function resolveCursorStyle(
  method: TrackingMethod | null,
  purpose: TrackerPurpose | null
): CursorStyles {
  if (method) {
    switch (method) {
      case TrackingMethod.AFFILIATE:
        return CursorStyles.AFFILIATE;
      case TrackingMethod.SHORTENER:
        return CursorStyles.SHORTENER;
      case TrackingMethod.REDIRECTOR:
        return CursorStyles.REDIRECTOR;
      case TrackingMethod.URL_DECORATION:
        return CursorStyles.URL_DECORATION;
    }
  }

  switch (purpose) {
    case TrackerPurpose.AD:
      return CursorStyles.AD;
    case TrackerPurpose.ANALYTICS:
      return CursorStyles.ANALYTICS;
    case TrackerPurpose.SOCIAL:
      return CursorStyles.SOCIAL;
    default:
      return CursorStyles.UNKNOWN;
  }
}
