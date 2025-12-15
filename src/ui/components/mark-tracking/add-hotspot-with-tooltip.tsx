import {TrackingMethod, type TrackerPurpose} from "@/types/tracking-enums";
import {createRoot, type Root} from "react-dom/client";
import {HotspotTooltip} from "../tooltip/hotspot-tooltip";

const hotspotRegistry = new Map<
  string,
  {
    portal: HTMLDivElement;
    root: Root;
    sources: string[];
    trackingParams: Record<string, string>;
    method: TrackingMethod;
    purpose?: TrackerPurpose | null;
  }
>();

export function addHotspotWithTooltip(
  src: string,
  x: number,
  y: number,
  trackingParams: Record<string, string>,
  method: TrackingMethod,
  purpose?: TrackerPurpose | null
) {
  const posKey = `${Math.round(x)},${Math.round(y)}-${method}`;

  // already an existing hotspot in this position?
  const existing = hotspotRegistry.get(posKey);

  if (existing) {
    // add souirce and merge trackin gparams
    existing.sources.push(src);
    Object.assign(existing.trackingParams, trackingParams);

    // re-render wwith new count
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

  // new hotspot
  const portal = document.createElement("div");
  portal.className = "tracking-hotspot-wrapper";

  let xOffset = 0;
  let yOffset = 0;

  switch (method) {
    case TrackingMethod.PIXEL:
      portal.style.zIndex = "100000";
      xOffset = 0;
      yOffset = 0;
      break;
    case TrackingMethod.IFRAME:
      portal.style.zIndex = "110000";
      xOffset = 10;
      yOffset = 10;
      break;
    case TrackingMethod.SCRIPT:
      portal.style.zIndex = "120000";
      xOffset = 10;
      yOffset = 10;
      break;
    default:
      portal.style.zIndex = "100000";
      xOffset = 0;
      yOffset = 0;
      break;
  }

  portal.style.left = `${x + xOffset}px`;
  portal.style.top = `${y + yOffset}px`;
  document.body.appendChild(portal);

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

  hotspotRegistry.set(posKey, {
    portal,
    root,
    sources,
    trackingParams,
    method,
    purpose,
  });
}
