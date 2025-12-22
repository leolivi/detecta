import {getTotalTrackers} from "@/utils/total-trackers";
import {cache} from "../service-worker";

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
  let color = "#2E7D32";
  if (count > 20) color = "#C62828";
  else if (count > 10) color = "#EF6C00";

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

// calculate the count of all trackers
export function updateTabBadge(tabId: number) {
  const counts = cache.getAllCounts(tabId);
  const total = getTotalTrackers(counts);
  setBadge(tabId, total);
}
