// ---- detect messages from service worker ---- //
// Global set to avoid duplicate notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /* ---- Tracking Type: 
    NETWORK TRACKER (Request-Level Tracking)
  ---- */
  if (message.type === "NETWORK_TRACKER_DETECTED") {
    console.log(message.count);
  }
  sendResponse({success: true, sender});
  return true;
});
