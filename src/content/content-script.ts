// ---- detect messages from service worker ---- //
// Global set to avoid duplicate notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /* ---- Tracking Type: 
    NETWORK TRACKER (Request-Level Tracking)
  ---- */
  if (message.type === "NETWORK_TRACKER_DETECTED") {
    console.log("Network:", message.count);
  }

  if (message.type === "URL_PARAMS_DETECTED") {
    console.log("Url:", message.params);
  }
  sendResponse({success: true, sender});
  return true;
});
