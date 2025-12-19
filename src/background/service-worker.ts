/// <reference types="chrome" />
import {handleNetworkRequests} from "./handlers/handle-network-requests";
import {handleUrlParams} from "./handlers/handle-url-params";
import {updateTabBadge} from "./handlers/update-badge";

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
  // restore cache from storage for a specific tab
  async restoreFromStorage(tabId: number): Promise<void> {
    const keys = [
      "trackers",
      "urlParams",
      "pixels",
      "iframes",
      "scripts",
      "widgets",
      "links",
    ].map((type) => `${type}_${tabId}`);

    const result = await chrome.storage.session.get(keys);

    // restore network trackers
    if (typeof result[`trackers_${tabId}`] === "number") {
      this.trackers.set(tabId, new Set());
    }

    // restore rest of trackers
    const types = [
      "urlParams",
      "pixels",
      "iframes",
      "scripts",
      "widgets",
      "links",
    ] as const;

    for (const type of types) {
      const value = result[`${type}_${tabId}`];
      if (Array.isArray(value)) {
        this[type].set(tabId, new Set(value));
      } else {
        this[type].set(tabId, new Set());
      }
    }
  }
}

export const cache = new TrackerCache();

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
    updateTabBadge(tabId);
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
        // store url params in session storage
        chrome.storage.session.set({[`urlParams_${tabId}`]: params});

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
        // store network trackers and tracker list in session storage
        const domains = Array.from(cache.trackers.get(tabId) || []); // TODO: check if this is bad for performance
        chrome.storage.session.set({
          [`trackers_${tabId}`]: count,
          [`trackerDomains_${tabId}`]: domains,
        });

        updateTabBadge(tabId);

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
  {urls: ["<all_urls>"]}
);

/* ---- MESSAGE HANDLER ---- */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  // handle tracker detection messages
  const cacheType =
    MESSAGE_TO_CACHE_TYPE[message.type as keyof typeof MESSAGE_TO_CACHE_TYPE];
  if (cacheType && tabId) {
    cache.add(cacheType, tabId, message.key);
    updateTabBadge(tabId);

    // store content script trackers in session storage too
    const items = Array.from(cache[cacheType].get(tabId) || []);
    chrome.storage.session.set({[`${cacheType}_${tabId}`]: items});
    return;
  }

  // handle get counts request
  if (message.type === "GET_TRACKER_COUNTS" && message.tabId != null) {
    // check if cache is empty and try restoring from storage if available
    const counts = cache.getAllCounts(message.tabId);
    const hasData = Object.values(counts).some((count) => count > 0);

    if (!hasData) {
      // restore from storage
      cache.restoreFromStorage(message.tabId).then(() => {
        const restoredCounts = cache.getAllCounts(message.tabId);
        sendResponse({...restoredCounts, sender, restored: true});
      });
      return true;
    }

    sendResponse({...counts, sender, restored: false});
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

  chrome.storage.session.remove(keysToRemove);
});
