import {getTotalTrackers} from "@/utils/total-trackers";
import {cache} from "../service-worker";

const MAX_HISTORY_ENTRIES = 100;

// function to set the extension badge
function setBadge(tabId: number, count: number) {
  if (count === 0) {
    chrome.action.setBadgeText({text: "", tabId});
    return;
  }

  chrome.action.setBadgeText({
    text: count.toString(),
    tabId,
  });

  // color based on tracker count
  let color = "#3E7F4A";     
  if (count > 20) color = "#8F2F2F";      
  else if (count > 10) color = "#9A5A1E";

  chrome.action.setBadgeBackgroundColor({
    color,
    tabId,
  });

  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({
      color: "#FFFFFF",
      tabId,
    });
  }
}

async function storeTrackerHistory(tabId: number, total: number) {
  if (total === 0) return;

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab?.url) return;
    const hostname = new URL(tab.url).hostname;
    if (!hostname || hostname === "newtab") return;

    const result = await chrome.storage.session.get("trackerHistory");
    const stored = result.trackerHistory;
    const history: Array<{hostname: string; total: number; timestamp: number}> =
      Array.isArray(stored) ? stored : [];

    const existing = history.findIndex((e) => e.hostname === hostname);
    if (existing >= 0) {
      history[existing] = {hostname, total, timestamp: Date.now()};
    } else {
      history.push({hostname, total, timestamp: Date.now()});
    }

    if (history.length > MAX_HISTORY_ENTRIES) {
      history.sort((a, b) => b.timestamp - a.timestamp);
      history.length = MAX_HISTORY_ENTRIES;
    }

    await chrome.storage.session.set({trackerHistory: history});
  } catch (e) {
    console.debug("could not store tracker history", e)
  }
}

// calculate the count of all trackers
export function updateTabBadge(tabId: number) {
  const counts = cache.getAllCounts(tabId);
  const total = getTotalTrackers(counts);
  setBadge(tabId, total);
  storeTrackerHistory(tabId, total);
}
