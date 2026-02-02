/// <reference types="chrome" />
import {handleNetworkRequests} from "./handlers/handle-network-requests";
import {handleUrlParams} from "./handlers/handle-url-params";
import {updateTabBadge} from "./handlers/update-badge";

/* ---- CACHE MANAGER ---- */
class TrackerCache {
  private trackers = new Map<number, Set<string>>();
  private urlParams = new Map<number, Set<string>>();
  private pixels = new Map<number, Set<string>>();
  private iframes = new Map<number, Set<string>>();
  private scripts = new Map<number, Set<string>>();
  private widgets = new Map<number, Set<string>>();
  private links = new Map<number, Set<string>>();

  private timestamps = new Map<number, number>();

  add(
    type:
      | "trackers"
      | "urlParams"
      | "pixels"
      | "iframes"
      | "scripts"
      | "widgets"
      | "links",
    tabId: number,
    key: string
  ): void {
    if (!this[type].has(tabId)) {
      this[type].set(tabId, new Set());
    }
    this[type].get(tabId)!.add(key);
    this.updateTimestamp(tabId);
    this.persistTab(tabId);
  }

  getTrackers(tabId: number): Set<string> {
    if (!this.trackers.has(tabId)) {
      this.trackers.set(tabId, new Set());
    }
    return this.trackers.get(tabId)!;
  }

  getUrlParams(tabId: number): Set<string> {
    if (!this.urlParams.has(tabId)) {
      this.urlParams.set(tabId, new Set());
    }
    return this.urlParams.get(tabId)!;
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
      hasData: this.hasData(tabId),
      timestamp: this.timestamps.get(tabId) ?? null,
    };
  }

  private hasData(tabId: number): boolean {
    return (
      (this.trackers.get(tabId)?.size ?? 0) > 0 ||
      (this.urlParams.get(tabId)?.size ?? 0) > 0 ||
      (this.pixels.get(tabId)?.size ?? 0) > 0 ||
      (this.iframes.get(tabId)?.size ?? 0) > 0 ||
      (this.scripts.get(tabId)?.size ?? 0) > 0 ||
      (this.widgets.get(tabId)?.size ?? 0) > 0 ||
      (this.links.get(tabId)?.size ?? 0) > 0
    );
  }

  getTimestamp(tabId: number): number | null {
    return this.timestamps.get(tabId) ?? null;
  }

  private updateTimestamp(tabId: number): void {
    this.timestamps.set(tabId, Date.now());
  }

  // storage only if necessary
  private async persistTab(tabId: number): Promise<void> {
    const data: Record<string, unknown> = {
      [`timestamp_${tabId}`]: this.timestamps.get(tabId),
    };

    const types = [
      "trackers",
      "urlParams",
      "pixels",
      "iframes",
      "scripts",
      "widgets",
      "links",
    ] as const;
    for (const type of types) {
      const set = this[type].get(tabId);
      if (set && set.size > 0) {
        data[`${type}_${tabId}`] = Array.from(set);
      }
    }

    await chrome.storage.session.set(data);
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
      "timestamp",
    ].map((t) => `${t}_${tabId}`);

    const result = await chrome.storage.session.get(keys);

    // restore network trackers
    const types = [
      "trackers",
      "urlParams",
      "pixels",
      "iframes",
      "scripts",
      "widgets",
      "links",
    ] as const;
    for (const type of types) {
      const arr = result[`${type}_${tabId}`];
      if (Array.isArray(arr) && arr.length > 0) {
        this[type].set(tabId, new Set(arr));
      }
    }

    const ts = result[`timestamp_${tabId}`];
    if (typeof ts === "number") {
      this.timestamps.set(tabId, ts);
    }
  }

  reset(tabId: number): void {
    this.trackers.delete(tabId);
    this.urlParams.delete(tabId);
    this.pixels.delete(tabId);
    this.iframes.delete(tabId);
    this.scripts.delete(tabId);
    this.widgets.delete(tabId);
    this.links.delete(tabId);
    this.timestamps.delete(tabId);
  }

  clear(tabId: number): void {
    this.reset(tabId);

    // storage cleanup
    const keys = [
      "trackers",
      "urlParams",
      "pixels",
      "iframes",
      "scripts",
      "widgets",
      "links",
      "timestamp",
    ].map((t) => `${t}_${tabId}`);

    chrome.storage.session.remove(keys);
  }
}

export const cache = new TrackerCache();
const STALE_AFTER_MS = 180_000;

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
  if (details.reason === "install") {
    console.log("Extension installed");
  }

  if (details.reason === "update" || details.reason === "install") {
    // clear all session storage on update/install
    await chrome.storage.session.clear();

    // reload all tabs to reset detection state
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith("chrome://")) {
        chrome.tabs.reload(tab.id).catch(() => {});
      }
    }
  }
});

/* ---- SIDE PANEL ---- */
chrome.sidePanel
  .setPanelBehavior({openPanelOnActionClick: true})
  .catch((error) => console.error(error));

/* ---- TAB UPDATE HANDLER ---- */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  // Reset cache when page is loading
  if (changeInfo.status === "loading" && changeInfo.url) {
    cache.reset(tabId);
    updateTabBadge(tabId);
  }

  if (changeInfo.status !== "complete") return;

  await cache.restoreFromStorage(tabId);

  /* ---- Tracking Type: 
    URL-Decoration & Attribution Tracker
  ---- */
  // Handle URL parameter tracking
  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url) return;

    handleUrlParams({
      urlString: tab.url,
      urlParamsCache: cache.getUrlParams(tabId),
      onParamsDetected: (params) => {
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
      details,
      trackersCache: cache.getTrackers(tabId),
      onTrackerDetected: (count, domain) => {
        updateTabBadge(tabId);

        // notify content script
        chrome.tabs
          .sendMessage(tabId, {
            type: "NETWORK_TRACKER_DETECTED",
            count,
            domain,
          })
          .catch(() => {
            console.debug("No content script available in this tab");
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
  }

  if (message.type === "RESET_CACHE" && sender.tab?.id != null) {
    cache.clear(sender.tab.id);
    updateTabBadge(sender.tab.id);
    sendResponse({success: true});
    return true;
  }

  // handle ping
  if (message.type === "PING") {
    sendResponse({alive: true});
    return true;
  }

  // handle get counts request
  if (message.type === "GET_TRACKER_COUNTS" && message.tabId != null) {
    (async () => {
      try {
        await chrome.tabs.sendMessage(message.tabId, {type: "PING"});
      } catch {
        // content script not injected yet, try injecting it
        try {
          await chrome.scripting.executeScript({
            target: {tabId: message.tabId},
            files: ["content.js"],
          });
          setTimeout(() => {
            chrome.tabs
              .sendMessage(message.tabId, {type: "RERUN_DETECTIONS"})
              .catch(() => {});
          }, 100);
        } catch (e) {
          console.warn("Could not inject content script", e);
        }
      }

      // try restoring from storage if cache is empty
      await cache.restoreFromStorage(message.tabId);

      const counts = cache.getAllCounts(message.tabId);
      const timestamp = cache.getTimestamp(message.tabId);
      const age = timestamp ? Date.now() - timestamp : null;
      const isStale = age != null && age > STALE_AFTER_MS;

      sendResponse({
        ...counts,
        hasData: Object.values(counts).some(
          (x) => typeof x === "number" && x > 0
        ),
        isStale,
        age,
      });
    })();
    return true;
  }
});

/* ---- TAB CLEANUP ---- */
chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  cache.clear(tabId);
});
