/// <reference types="chrome" />

import {handleBeforeRequest} from "./handle-before-request";
import {checkUrlTrackingParams} from "./handle-tab-update";

// ---- IN-MEMORY CACHE ---- //
// per tab saving
// tracking method
const trackersCache: Map<number, Set<string>> = new Map();
const urlParamsCache: Map<number, Set<string>> = new Map();
const pixelCache: Map<number, Set<string>> = new Map();
const iframeCache: Map<number, Set<string>> = new Map();
const scriptCache: Map<number, Set<string>> = new Map();
const widgetCache: Map<number, Set<string>> = new Map();
const linkCache: Map<number, Set<string>> = new Map();

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
    pixelCache.set(tabId, new Set());
    iframeCache.set(tabId, new Set());
    scriptCache.set(tabId, new Set());
    widgetCache.set(tabId, new Set());
    widgetCache.set(tabId, new Set());
    linkCache.set(tabId, new Set());
  }

  /* ---- Tracking Type: 
  THIRD PARTY TRACKERS (Content Script Events)
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

// react on message  to get the tracker counts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PIXEL_TRACKER_DETECTED") {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    if (!pixelCache.has(tabId)) {
      pixelCache.set(tabId, new Set());
    }

    pixelCache.get(tabId)!.add(message.key);
  }

  if (message.type === "IFRAME_TRACKER_DETECTED") {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    if (!iframeCache.has(tabId)) {
      iframeCache.set(tabId, new Set());
    }

    iframeCache.get(tabId)!.add(message.key);
  }

  if (message.type === "SCRIPT_TRACKER_DETECTED") {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    if (!scriptCache.has(tabId)) {
      scriptCache.set(tabId, new Set());
    }

    scriptCache.get(tabId)!.add(message.key);
  }

  if (message.type === "WIDGET_TRACKER_DETECTED") {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    if (!widgetCache.has(tabId)) {
      widgetCache.set(tabId, new Set());
    }

    widgetCache.get(tabId)!.add(message.key);
  }

  if (message.type === "LINK_TRACKER_DETECTED") {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    if (!linkCache.has(tabId)) {
      linkCache.set(tabId, new Set());
    }

    linkCache.get(tabId)!.add(message.key);
  }

  if (message.type === "GET_TRACKER_COUNTS" && message.tabId != null) {
    const networkRequests = trackersCache.get(message.tabId)?.size ?? 0;
    const urlParameters = urlParamsCache.get(message.tabId)?.size ?? 0;
    const pixels = pixelCache.get(message.tabId)?.size ?? 0;
    const iframes = iframeCache.get(message.tabId)?.size ?? 0;
    const scripts = scriptCache.get(message.tabId)?.size ?? 0;
    const widgets = widgetCache.get(message.tabId)?.size ?? 0;
    const links = linkCache.get(message.tabId)?.size ?? 0;

    sendResponse({
      networkRequests,
      urlParameters,
      pixels,
      iframes,
      scripts,
      widgets,
      links,
      sender,
    });
    return true;
  }
});

/* --- Cleanup --- */
// remove tracking count if tab is closed
type CacheEntry = {
  cache: Map<number, unknown>;
  storageKey: (tabId: number) => string;
};

const TAB_CACHES: CacheEntry[] = [
  {cache: trackersCache, storageKey: (id) => `trackers_${id}`},
  {cache: urlParamsCache, storageKey: (id) => `urlParams_${id}`},
  {cache: pixelCache, storageKey: (id) => `pixels_${id}`},
  {cache: iframeCache, storageKey: (id) => `iframes_${id}`},
  {cache: scriptCache, storageKey: (id) => `scripts_${id}`},
  {cache: widgetCache, storageKey: (id) => `widgets_${id}`},
  {cache: linkCache, storageKey: (id) => `links_${id}`},
];

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  for (const {cache, storageKey} of TAB_CACHES) {
    if (!cache.has(tabId)) continue;

    cache.delete(tabId);
    chrome.storage.local.remove(storageKey(tabId));
  }
});
