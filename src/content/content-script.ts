import {showSonnerNotification} from "@/ui/components/notification/show-notification";
import {detectTrackingPixels} from "./tracking-pixel.content";
import {observeDomChanges} from "./observe-dom-changes";
import {detectTrackingIframes} from "./tracking-iframe.content";
import {detectTrackingScripts} from "./tracking-script.content";
import {detectTrackingSocialWidgets} from "./tracking-widget.content";
import {analyzeLinks} from "./analyze-links.content";

/* ---- Initialisierung ---- */
function init() {
  detectTrackingPixels();
  detectTrackingIframes();
  detectTrackingScripts();
  detectTrackingSocialWidgets();
  analyzeLinks();
  observeDomChanges();
}

// initialize if content is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ---- detect messages from service worker ---- //
// Global set to avoid duplicate notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /* ---- Tracking Type: 
    NETWORK TRACKER (Request-Level Tracking)
  ---- */
  if (message.type === "NETWORK_TRACKER_DETECTED") {
    console.log("NETWORK_TRACKER_DETECTED", message.count);
  }

  /* ---- Tracking Type: 
  THIRD PARTY TRACKERS (Content Script Events)
  ---- */
  if (message.type === "URL_PARAMS_DETECTED") {
    console.log("URL_PARAMS_DETECTED", message.params);
    showSonnerNotification(
      `${message.count} URL Tracking detected: ${message.params}`,
      "warning"
    );
  }
  sendResponse({success: true, sender});
  return true;
});
