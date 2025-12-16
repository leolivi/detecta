import {markTracking} from "@/utils/mark-tracking";

import {showSonnerNotification} from "@/ui/components/notification/show-notification";
import {detectTrackingLinks} from "./detection/link-detector";
import {
  detectAdvertisements,
  redetectAdsByDomain,
} from "./detection/ad-detector";
import {detectTrackingScripts} from "./detection/script-detector";
import {detectTrackingPixels} from "./detection/pixel-detector";
import {detectTrackingIframes} from "./detection/iframe-detector";
import {detectTrackingWidgets} from "./detection/widget-detector";
import {observeDomChanges} from "../utils/observe-dom-changes";

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

// ---- detect messages from service worker ---- //
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.log("Extension context invalidated, skipping message");
    return false;
  }

  /* ---- Tracking Type: 
    NETWORK TRACKER (Request-Level Tracking)
  ---- */
  if (message.type === "NETWORK_TRACKER_DETECTED") {
    const adResults = redetectAdsByDomain(message.domain);
    markTracking(adResults);
  }

  /* ---- Tracking Type: 
    URL-Decoration & Attribution Tracker
  ---- */
  if (message.type === "URL_PARAMS_DETECTED") {
    showSonnerNotification(
      `${message.count} URL Tracking detected: ${message.params}`,
      "warning"
    );
  }

  sendResponse({success: true, sender});
  return true;
});
