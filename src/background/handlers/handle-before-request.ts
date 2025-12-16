import {TRACKING_DOMAINS} from "@/data/tracking-domains";

interface HandleNetworkRequests {
  tabId: number;
  details: chrome.webRequest.OnBeforeRequestDetails;
  trackersCache: Map<number, Set<string>>;
  onTrackerDetected: (count: number) => void;
}

// function to handle network request tracking
export function handleNetworkRequests({
  tabId,
  details,
  trackersCache,
  onTrackerDetected,
}: HandleNetworkRequests): void {
  let url: URL;

  try {
    url = new URL(details.url);
  } catch {
    return;
  }

  // check if request is a tracker
  const tracker = TRACKING_DOMAINS.find((t) => url.hostname.endsWith(t.domain));

  if (!tracker) return;

  // set tabId if none is set already
  let trackerSet = trackersCache.get(tabId);
  if (!trackerSet) {
    trackerSet = new Set();
    trackersCache.set(tabId, trackerSet);
  }

  if (trackerSet.has(tracker.domain)) return;

  // increment in memory counter of trackers
  trackerSet.add(tracker.domain);
  onTrackerDetected(trackerSet.size);
}
