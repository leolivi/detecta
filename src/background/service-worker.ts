/// <reference types="chrome" />

import {handleBeforeRequest} from "./handle-before-request";
import {checkUrlTrackingParams} from "./handle-tab-update";

// ---- IN-MEMORY CACHE ---- //
// per tab saving
const trackersCache: Map<number, Set<string>> = new Map();
const urlParamsCache: Map<number, Set<string>> = new Map();

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
    trackersCache.set(tabId, new Set());
    urlParamsCache.set(tabId, new Set());
  }

  /* ---- Tracking Type: 
  NETWORK TRACKER (Request-Level Tracking)
  ---- */

  if (changeInfo.status !== "complete") return;

  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url) return;
    checkUrlTrackingParams({
      tabId,
      urlString: tab.url,
      urlParamsCache,
      onParamsDetected: (params) => {
        // save params to storage
        chrome.storage.local.set({
          [`urlParams_${tabId}`]: params,
        });
        // notify content script
        chrome.tabs
          .sendMessage(tabId, {
            type: "URL_PARAMS_DETECTED",
            params,
            count: params.length,
          })
          .catch((error) => {
            console.debug("Could not send message to tab", tabId, error);
          });
      },
    });
  });
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

// react on message from tracking chart to get the tracker counts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_TRACKER_COUNTS" && message.tabId != null) {
    const networkRequests = trackersCache.get(message.tabId)?.size ?? 0;
    const urlParameters = urlParamsCache.get(message.tabId)?.size ?? 0;

    sendResponse({
      networkRequests,
      urlParameters,
      iframes: 0,
      pixels: 0,
      widgets: 0,
      scripts: 0,
      sender,
    });
    return true; // keep channel open for async
  }
});

/* --- Cleanup --- */
// remove tracking count if tab is closed
chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  if (trackersCache.has(tabId)) {
    trackersCache.delete(tabId);
    chrome.storage.local.remove(`trackers_${tabId}`);
  }

  if (urlParamsCache.has(tabId)) {
    urlParamsCache.delete(tabId);
    chrome.storage.local.remove(`urlParams_${tabId}`);
  }
});
