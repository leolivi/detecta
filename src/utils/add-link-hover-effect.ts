import {CursorStyles} from "@/types/cursor";
import type {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";

// function add hover effect to tracked links
export function addLinkHoverEffect(
  link: HTMLAnchorElement,
  method: TrackingMethod | null,
  purpose: TrackerPurpose | null
) {
  // asdd colored outline
  link.style.setProperty("outline", `2px solid red`, "important");
  link.style.setProperty("outline-offset", "2px", "important");

  // determine cursor (priority: purpose > method > unknown)
  const cursorKey = toStyleKey(purpose || method) as keyof typeof CursorStyles;
  const cursor = CursorStyles[cursorKey] || CursorStyles.UNKNOWN;

  // hover behavior
  link.addEventListener("mouseenter", () => {
    link.style.cursor = cursor;
  });
  link.addEventListener("mouseleave", () => {
    link.style.cursor = "pointer";
  });

  // TODO: add tooltip?
}

// helper to ensure uppercase for cursor enum matching -> "url_decoration" -> "URL_DECORATION"
function toStyleKey(value: string | null): string {
  if (!value) return "UNKNOWN";
  return value.toUpperCase();
}
