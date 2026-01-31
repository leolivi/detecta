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

// calculate the count of all trackers
export function updateTabBadge(tabId: number) {
  const counts = cache.getAllCounts(tabId);
  const total = getTotalTrackers(counts);
  setBadge(tabId, total);
}
