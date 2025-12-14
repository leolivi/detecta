// ---- detect messages from service worker ---- //

import {showSonnerNotification} from "@/ui/components/notification/show-notification";

// Global set to avoid duplicate notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /* ---- Tracking Type: 
    NETWORK TRACKER (Request-Level Tracking)
  ---- */
  if (message.type === "NETWORK_TRACKER_DETECTED") {
    console.log("NETWORK_TRACKER_DETECTED", message.count);
  }

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
