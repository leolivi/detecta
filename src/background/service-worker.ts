/// <reference types="chrome" />

import {handleBeforeRequest} from "./handle-before-request";

// ---- IN-MEMORY CACHE ---- //
let trackersCache: Map<number, Set<string>> = new Map();

// ---- INSTALLATION ---- //
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("Extension started");

  if (details.reason === "install") {
    chrome.tabs.create({
      url: "https://example.com/welcome",
    });
  }
});

/* ---- RESET on Update ---- */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // reset counter when page is reloading
  if (changeInfo.status === "loading" && changeInfo.url) {
    console.log(
      `Tab ${tabId}: Navigation zu ${changeInfo.url} - Reset counter`
    );
    trackersCache.set(tabId, new Set());
  }
});

/* ---- Tracking Type: 
NETWORK TRACKER (Request-Level Tracking)
---- */

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // ignore requests without a tabId
    const tabId = details.tabId;
    if (tabId < 0) return;

    if (details.url.includes("chrome-extension://")) return;

    handleBeforeRequest({
      tabId,
      details,
      trackersCache,
      onTrackerDetected: (count) => {
        // save tracker count to storage
        chrome.storage.local.set({[`trackers_${tabId}`]: count});
        // notify content script
        chrome.tabs
          .sendMessage(tabId, {
            type: "NETWORK_TRACKER_DETECTED",
            count,
          })
          .catch(() => {
            console.warn("No content script available in this tab");
          });
      },
    });
    return undefined;
  },
  {urls: ["<all_urls>"]}
);

/* ---- Tracking Type: 
NETWORK TRACKER (Request-Level Tracking)
---- */

/* --- Cleanup --- */
// remove tracking count if tab is closed
chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  if (trackersCache.has(tabId)) {
    trackersCache.delete(tabId);
    chrome.storage.local.remove(`trackers_${tabId}`);
    console.log(`Removed tracking for closed tab ${tabId}`);
  }
});
