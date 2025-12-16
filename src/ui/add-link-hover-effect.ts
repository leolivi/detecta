import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {changeCursor} from "../utils/change-cursor";
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

// function add hover effect to tracked ads
export function wrapIframeForHover(iframe: HTMLIFrameElement): HTMLElement {
  iframe.style.pointerEvents = "none";

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: relative;
    display: inline-block;
    width: ${iframe.offsetWidth}px;
    height: ${iframe.offsetHeight}px;
  `;

  iframe.parentNode?.insertBefore(wrapper, iframe);
  wrapper.appendChild(iframe);

  return wrapper;
}
