/// <reference types="chrome" />

import {TRACKING_DOMAINS} from "../data/tracking-domains";

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

    handleBeforeRequest(tabId, details);
    return undefined;
  },
  {urls: ["<all_urls>"]}
);

function handleBeforeRequest(
  tabId: number,
  details: chrome.webRequest.OnBeforeRequestDetails
): void {
  try {
    const url = new URL(details.url);

    // check if request is a tracker
    const isTracker = TRACKING_DOMAINS.find((tracker) =>
      url.hostname.includes(tracker.domain)
    );

    if (!isTracker) return;

    // set tabId if none is set already
    if (!trackersCache.has(tabId)) {
      trackersCache.set(tabId, new Set());
    }

    const trackerSet = trackersCache.get(tabId)!;
    const trackerDomain = isTracker.domain;

    if (trackerSet.has(trackerDomain)) {
      return;
    }

    // increment in-memory counter of trackers
    trackerSet.add(trackerDomain);

    // save tracker count to storage
    chrome.storage.local.set({
      [`trackers_${tabId}`]: trackerSet.size,
    });

    // notify content script
    chrome.tabs.sendMessage(details.tabId, {
      type: "NETWORK_TRACKER_DETECTED",
      count: trackerSet.size,
    });
  } catch (e) {
    console.error("invalid url", e);
  }
}

/* --- Cleanup --- */
// remove tracking count if tab is closed
chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  if (trackersCache.has(tabId)) {
    trackersCache.delete(tabId);
    chrome.storage.local.remove(`trackers_${tabId}`);
    console.log(`Removed tracking for closed tab ${tabId}`);
  }
});
