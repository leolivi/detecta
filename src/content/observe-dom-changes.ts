import {detectTrackingIframes} from "./tracking-iframe.content";
import {detectTrackingPixels} from "./tracking-pixel.content";

/* ---- DOM Observer ---- */
export function observeDomChanges() {
  let timeout: number | undefined;

  const observer = new MutationObserver(() => {
    if (timeout) clearTimeout(timeout);

    timeout = window.setTimeout(() => {
      detectTrackingPixels();
      detectTrackingIframes();
      timeout = undefined;
    }, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
