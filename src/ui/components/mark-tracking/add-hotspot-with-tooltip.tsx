import type {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
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
  const posKey = `${Math.round(x)},${Math.round(y)}`;
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
  portal.style.left = `${x}px`;
  portal.style.top = `${y}px`;
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
