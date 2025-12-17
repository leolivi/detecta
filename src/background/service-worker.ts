/// <reference types="chrome" />
import { handleNetworkRequests } from "./handlers/handle-network-requests";
import { handleUrlParams } from "./handlers/handle-url-params";

/* ---- CACHE MANAGER ---- */
class TrackerCache {
  // they are used by handler functions
  trackers = new Map<number, Set<string>>();
  urlParams = new Map<number, Set<string>>();

  // they are used by content script messages
  private pixels = new Map<number, Set<string>>();
  private iframes = new Map<number, Set<string>>();
  private scripts = new Map<number, Set<string>>();
  private widgets = new Map<number, Set<string>>();
  private links = new Map<number, Set<string>>();

  add(
    type: "pixels" | "iframes" | "scripts" | "widgets" | "links",
    tabId: number,
    key: string
  ): void {
    if (!this[type].has(tabId)) {
      this[type].set(tabId, new Set());
    }
    this[type].get(tabId)!.add(key);
  }

  getAllCounts(tabId: number) {
    return {
      networkRequests: this.trackers.get(tabId)?.size ?? 0,
      urlParameters: this.urlParams.get(tabId)?.size ?? 0,
      pixels: this.pixels.get(tabId)?.size ?? 0,
      iframes: this.iframes.get(tabId)?.size ?? 0,
      scripts: this.scripts.get(tabId)?.size ?? 0,
      widgets: this.widgets.get(tabId)?.size ?? 0,
      links: this.links.get(tabId)?.size ?? 0,
    };
  }

  reset(tabId: number): void {
    this.trackers.set(tabId, new Set());
    this.urlParams.set(tabId, new Set());
    this.pixels.set(tabId, new Set());
    this.iframes.set(tabId, new Set());
    this.scripts.set(tabId, new Set());
    this.widgets.set(tabId, new Set());
    this.links.set(tabId, new Set());
  }

  clear(tabId: number): void {
    this.trackers.delete(tabId);
    this.urlParams.delete(tabId);
    this.pixels.delete(tabId);
    this.iframes.delete(tabId);
    this.scripts.delete(tabId);
    this.widgets.delete(tabId);
    this.links.delete(tabId);
  }
}

const cache = new TrackerCache();

/* ---- MESSAGE TYPE MAPPING ---- */
const MESSAGE_TO_CACHE_TYPE = {
  PIXEL_TRACKER_DETECTED: "pixels",
  IFRAME_TRACKER_DETECTED: "iframes",
  SCRIPT_TRACKER_DETECTED: "scripts",
  WIDGET_TRACKER_DETECTED: "widgets",
  LINK_TRACKER_DETECTED: "links",
} as const;

/* ---- INSTALLATION ---- */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("Extension started");

  if (details.reason === "install") {
    chrome.tabs.create({
      url: "https://example.com/welcome",
    });
  }
});

/* ---- TAB UPDATE HANDLER ---- */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // Reset cache when page is loading
  if (changeInfo.status === "loading" && changeInfo.url) {
    cache.reset(tabId);
  }

  if (changeInfo.status !== "complete") return;

  /* ---- Tracking Type: 
    URL-Decoration & Attribution Tracker
  ---- */
  // Handle URL parameter tracking
  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url) return;

    handleUrlParams({
      tabId,
      urlString: tab.url,
      urlParamsCache: cache.urlParams,
      onParamsDetected: (params) => {
        chrome.storage.local.set({ [`urlParams_${tabId}`]: params });

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
/* ---- NETWORK REQUEST HANDLER ---- */

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0 || details.url.includes("chrome-extension://")) return;

    handleNetworkRequests({
      tabId,
      details,
      trackersCache: cache.trackers,
      onTrackerDetected: (count, domain) => {
        chrome.storage.local.set({ [`trackers_${tabId}`]: count });

        // notify content script
        chrome.tabs
          .sendMessage(tabId, {
            type: "NETWORK_TRACKER_DETECTED",
            count,
            domain,
          })
          .catch(() => {
            console.warn("No content script available in this tab");
          });
      },
    });
    return undefined;
  },
  { urls: ["<all_urls>"] }
);

/* ---- WEB NAVIGATION HANDLERS (Back/Forward & SPA) ---- */
// rerender after navigation change
chrome.webNavigation.onCommitted.addListener((details) => {
  try {
    const { tabId, frameId, url } = details;
    // only handle top-frame navigations
    if (frameId !== 0 || tabId < 0) return;

    // reset per-tab caches on navigation (including back/forward)
    cache.reset(tabId);

    // re-scan URL parameters immediately on navigation
    if (url) {
      handleUrlParams({
        tabId,
        urlString: url,
        urlParamsCache: cache.urlParams,
        onParamsDetected: (params) => {
          chrome.storage.local.set({ [`urlParams_${tabId}`]: params });
          chrome.tabs
            .sendMessage(tabId, {
              type: "URL_PARAMS_DETECTED",
              params,
              count: params.length,
            })
            .catch((error) => {
              console.warn("Could not send message to tab", tabId, error);
            });
        },
      });
    }

    // send commant do rerender to content script
    chrome.tabs.sendMessage(tabId, { type: "RELOAD_DETECTIONS" }).catch(() => {
      console.warn("Could not send message to tab", tabId);
    });
  } catch (e) {
    console.warn("onCommitted navigation handling error", e);
  }
});

// if frame changes to a new URL
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  try {
    const { tabId, frameId, url } = details;
    if (frameId !== 0 || tabId < 0) return;

    cache.reset(tabId);

    if (url) {
      handleUrlParams({
        tabId,
        urlString: url,
        urlParamsCache: cache.urlParams,
        onParamsDetected: (params) => {
          chrome.storage.local.set({ [`urlParams_${tabId}`]: params });
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
    }

    // send commant do rerender to content script
    chrome.tabs.sendMessage(tabId, { type: "RELOAD_DETECTIONS" }).catch(() => {
      console.warn("Could not send message to tab", tabId);
    });
  } catch (e) {
    console.warn("onHistoryStateUpdated handling error", e);
  }
});

/* ---- MESSAGE HANDLER ---- */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  // handle tracker detection messages
  const cacheType =
    MESSAGE_TO_CACHE_TYPE[message.type as keyof typeof MESSAGE_TO_CACHE_TYPE];
  if (cacheType && tabId) {
    cache.add(cacheType, tabId, message.key);
    return;
  }

  // handle get counts request
  if (message.type === "GET_TRACKER_COUNTS" && message.tabId != null) {
    const counts = cache.getAllCounts(message.tabId);
    sendResponse({ ...counts, sender });
    return true;
  }
});

/* ---- TAB CLEANUP ---- */
chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  cache.clear(tabId);

  // remove from storage
  const keysToRemove = [
    "trackers",
    "urlParams",
    "pixels",
    "iframes",
    "scripts",
    "widgets",
    "links",
  ].map((type) => `${type}_${tabId}`);

  chrome.storage.local.remove(keysToRemove);
});
