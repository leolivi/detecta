import {TrackingMethod, type TrackerPurpose} from "@/types/tracking-enums";
import {createRoot, type Root} from "react-dom/client";
import {HotspotTooltip} from "../tooltip/hotspot-tooltip";

const hotspotRegistry = new Map<
  HTMLElement,
  {
    portal: HTMLDivElement;
    root: Root;
    sources: string[];
    trackingParams: Record<string, string>;
    method: TrackingMethod;
    purpose?: TrackerPurpose | null;
  }
>();

function ensurePositioned(el: HTMLElement): void {
  const style = getComputedStyle(el);
  if (style.position === "static") {
    el.style.position = "relative";
  }
}

function isElementVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return (
    rect.width > 10 &&
    rect.height > 10 &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    !(el instanceof HTMLScriptElement)
  );
}

function findVisibleParent(el: HTMLElement): HTMLElement | null {
  let current = el.parentElement;
  while (current && current !== document.body) {
    if (isElementVisible(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export function addHotspotWithTooltip(
  element: HTMLElement,
  src: string,
  trackingParams: Record<string, string>,
  method: TrackingMethod,
  purpose?: TrackerPurpose | null
) {
  // Find the target element to attach the hotspot to
  let targetElement = element;
  let useBodyFallback = false;

  if (!isElementVisible(element)) {
    const visibleParent = findVisibleParent(element);
    if (visibleParent) {
      targetElement = visibleParent;
    } else {
      useBodyFallback = true;
    }
  }

  // already an existing hotspot for this element?
  const existing = hotspotRegistry.get(targetElement);

  if (existing) {
    existing.sources.push(src);
    Object.assign(existing.trackingParams, trackingParams);

    existing.root.render(
      <HotspotTooltip
        sources={existing.sources}
        trackingParams={existing.trackingParams}
        method={existing.method}
        purpose={existing.purpose}
      />
    );
    return;
  }

  if (!useBodyFallback) {
    ensurePositioned(targetElement);
  }

  const portal = document.createElement("div");
  portal.className = "tracking-hotspot-wrapper";

  let offset = 0;

  switch (method) {
    case TrackingMethod.PIXEL:
      portal.style.zIndex = "100000";
      offset = 0;
      break;
    case TrackingMethod.IFRAME:
      portal.style.zIndex = "110000";
      offset = 10;
      break;
    case TrackingMethod.SCRIPT:
      portal.style.zIndex = "120000";
      offset = 10;
      break;
    case TrackingMethod.WIDGET:
      portal.style.zIndex = "130000";
      offset = 10;
      break;
    default:
      portal.style.zIndex = "100000";
      offset = 0;
      break;
  }

  portal.style.position = "absolute";

  if (useBodyFallback) {
    const rect = element.getBoundingClientRect();
    portal.style.top = `${rect.top + window.scrollY + offset}px`;
    portal.style.left = `${rect.left + window.scrollX + offset}px`;
    document.body.appendChild(portal);
  } else {
    portal.style.top = `${offset}px`;
    portal.style.left = `${offset}px`;
    targetElement.appendChild(portal);
  }

  const root = createRoot(portal);
  const sources = [src];

  root.render(
    <HotspotTooltip
      sources={sources}
      trackingParams={trackingParams}
      method={method}
      purpose={purpose}
    />
  );

  hotspotRegistry.set(element, {
    portal,
    root,
    sources,
    trackingParams,
    method,
    purpose,
  });
}
