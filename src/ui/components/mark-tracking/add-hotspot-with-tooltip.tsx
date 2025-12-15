import type {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {createRoot} from "react-dom/client";
import {HotspotTooltip} from "../tooltip/hotspot-tooltip";

export function addHotspotWithTooltip(
  src: string,
  x: number,
  y: number,
  trackingParams: Record<string, string>,
  method: TrackingMethod,
  purpose?: TrackerPurpose | null
) {
  const portal = document.createElement("div");
  portal.className = "tracking-hotspot-wrapper";
  portal.style.left = `${x}px`;
  portal.style.top = `${y}px`;

  document.body.appendChild(portal);

  const root = createRoot(portal);
  root.render(
    <HotspotTooltip
      src={src}
      trackingParams={trackingParams}
      method={method}
      purpose={purpose}
    />
  );
}
