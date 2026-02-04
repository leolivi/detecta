import { markTracking, resetTracking } from "@/utils/mark-tracking";

import { showSonnerNotification } from "@/ui/components/notification/show-notification";
import { redetectAdsByDomain } from "@/utils/tracking-helpers";
import { observeDomChanges } from "../utils/observe-dom-changes";
import { detectAdvertisements } from "./detection/ad-detector";
import { detectTrackingIframes } from "./detection/iframe-detector";
import { detectTrackingLinks } from "./detection/link-detector";
import { detectTrackingPixels } from "./detection/pixel-detector";
import { detectTrackingScripts } from "./detection/script-detector";
import { detectTrackingWidgets } from "./detection/widget-detector";

const alreadyProcessedDomains = new Set<string>();

export function runAllDetections(): void {
  const allResults = [
    ...detectTrackingLinks(),
    ...detectTrackingPixels(),
    ...detectTrackingIframes(),
    ...detectTrackingScripts(),
    ...detectTrackingWidgets(),
    ...detectAdvertisements(),
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

// ---- MUTATION OBSERVER to detect changes in URL (privacy friendly instead of chrome.webNavigation.onHistoryStateUpdated to check SPA) ---- //
let lastUrl = location.href;

// detect URL changes in SPAs
const urlObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;

    chrome.runtime.sendMessage({ type: "RESET_CACHE" });
    resetTracking();
    // re-run detections
    runAllDetections();
  }
});

// watch for DOM changes that might indicate navigation
urlObserver.observe(document, {
  subtree: true,
  childList: true,
});

// also listen to popstate (back/forward in SPAs)
window.addEventListener("popstate", () => {
  runAllDetections();
});

// ---- detect messages from service worker ---- //
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // check if extension context is still valid
  if (!chrome.runtime?.id) {
    return false;
  }

  if (message.type === "PING") {
    sendResponse({ alive: true });
    return true;
  }

  if (message.type === "RERUN_DETECTIONS") {
    runAllDetections();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "TOGGLE_HOTSPOTS") {
    const hotspots = document.querySelectorAll(".tracking-hotspot-wrapper");
    hotspots.forEach((el) => {
      (el as HTMLElement).style.display = message.visible ? "block" : "none";
    });
    sendResponse({ success: true });
    return true;
  }

  /* ---- Tracking Type: 
    NETWORK TRACKER (Request-Level Tracking)
  ---- */
  if (message.type === "NETWORK_TRACKER_DETECTED") {
    if (!alreadyProcessedDomains.has(message.domain)) {
      alreadyProcessedDomains.add(message.domain);
      const adResults = redetectAdsByDomain(message.domain);
      markTracking(adResults);
    }
    console.log("NETWORK_TRACKER_DETECTED", message.count);
  }

  /* ---- Tracking Type: 
    URL-Decoration & Attribution Tracker
  ---- */
  if (message.type === "URL_PARAMS_DETECTED") {
    showSonnerNotification(
      `${message.count} URL Tracking detected: ${message.params}`,
      "warning",
    );
    console.log("URL_PARAMS_DETECTED", message.count);
  }

  sendResponse({ success: true, sender });
  return true;
});
