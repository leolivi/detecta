import type {CursorStyles} from "@/types/cursor";

export function changeCursor(element: HTMLElement, mode: CursorStyles) {
  element.style.cursor = mode;
}
