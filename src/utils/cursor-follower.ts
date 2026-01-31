import {CursorIcons, type CursorIconType} from "@/types/cursor";

let follower: HTMLImageElement | null = null;
let currentIcon: CursorIconType = null;

function createFollower(): HTMLImageElement {
  const el = document.createElement("img");
  el.id = "detecta-cursor-follower";
  el.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999999;
    width: 24px;
    height: 24px;
    display: none;
  `;
  document.body.appendChild(el);
  return el;
}

function handleMouseMove(e: MouseEvent) {
  if (follower && currentIcon) {
    follower.style.left = `${e.clientX + 12}px`;
    follower.style.top = `${e.clientY + 12}px`;
  }
}

export function showCursorIcon(iconType: CursorIconType) {
  if (!iconType) {
    hideCursorIcon();
    return;
  }

  if (!follower) {
    follower = createFollower();
    document.addEventListener("mousemove", handleMouseMove);
  }

  if (currentIcon !== iconType) {
    currentIcon = iconType;
    follower.src = CursorIcons[iconType];
  }

  follower.style.display = "block";
}

export function hideCursorIcon() {
  if (follower) {
    follower.style.display = "none";
  }
  currentIcon = null;
}
