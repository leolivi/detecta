import {runAllDetections} from "../content/content-script";

/* ---- DOM Observer ---- */
export function observeDomChanges() {
  let timeout: number | undefined;

  const observer = new MutationObserver(() => {
    if (timeout) clearTimeout(timeout);

    timeout = window.setTimeout(() => {
      runAllDetections();
      timeout = undefined;
    }, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
