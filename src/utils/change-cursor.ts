import type {CursorStyles} from "@/types/cursor";
import type {TrackingMethod} from "@/types/tracking-enums";

export function changeCursor(
  element: HTMLElement,
  mode: CursorStyles,
  method: TrackingMethod | null
) {
  element.style.cursor = mode;
  console.log("CURSOR CHANGE - Method:", method);
}
