import { markTracking } from "@/utils/mark-tracking";

import { showSonnerNotification } from "@/ui/components/notification/show-notification";
import { observeDomChanges } from "../utils/observe-dom-changes";
import {
  detectAdvertisements,
  redetectAdsByDomain,
} from "./detection/ad-detector";
import { detectTrackingIframes } from "./detection/iframe-detector";
import { detectTrackingLinks } from "./detection/link-detector";
import { detectTrackingPixels } from "./detection/pixel-detector";
import { detectTrackingScripts } from "./detection/script-detector";
import { detectTrackingWidgets } from "./detection/widget-detector";

export function runAllDetections(): void {
  const allResults = [
    ...detectTrackingLinks(),
    ...detectAdvertisements(),
    ...detectTrackingPixels(),
    ...detectTrackingIframes(),
    ...detectTrackingScripts(),
    ...detectTrackingWidgets(),
  ];

  markTracking(allResults);
}

/* ---- Initialisierung ---- */
function init(): void {
  runAllDetections();
  observeDomChanges();
}

// initialize if content is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// rerender detection on cache restores and history navigation
window.addEventListener("pageshow", () => {
  try {
    runAllDetections();
  } catch (e) {
    console.debug("pageshow detection error", e);
  }
});

window.addEventListener("popstate", () => {
  try {
    runAllDetections();
  } catch (e) {
    console.debug("popstate detection error", e);
  }
});

// ---- detect messages from service worker ---- //
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.log("Extension context invalidated, skipping message");
    return false;
  }

  // trigger a re-run of all detections when requested by the service worker (e.g., back/forward or SPA nav)
  if (message.type === "RELOAD_DETECTIONS") {
    try {
      runAllDetections();
    } catch (e) {
      console.debug("RELOAD_DETECTIONS error", e);
    }
  }

  /* ---- Tracking Type: 
    NETWORK TRACKER (Request-Level Tracking)
  ---- */
  if (message.type === "NETWORK_TRACKER_DETECTED") {
    const adResults = redetectAdsByDomain(message.domain);
    markTracking(adResults);
    console.log("NETWORK_TRACKER_DETECTED", message.count);
  }

  /* ---- Tracking Type: 
    URL-Decoration & Attribution Tracker
  ---- */
  if (message.type === "URL_PARAMS_DETECTED") {
    showSonnerNotification(
      `${message.count} URL Tracking detected: ${message.params}`,
      "warning"
    );
    console.log("URL_PARAMS_DETECTED", message.count);
  }

  sendResponse({ success: true, sender });
  return true;
});
