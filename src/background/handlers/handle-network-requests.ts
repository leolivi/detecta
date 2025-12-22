import {TRACKING_DOMAINS} from "@/data/tracking-domains";

interface HandleNetworkRequests {
  details: chrome.webRequest.OnBeforeRequestDetails;
  trackersCache: Set<string>;
  onTrackerDetected: (count: number, domain: string) => void;
}

// function to handle network request tracking
export function handleNetworkRequests({
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

  if (trackersCache.has(tracker.domain)) return;

  // increment in memory counter of trackers
  trackersCache.add(tracker.domain);
  onTrackerDetected(trackersCache.size, tracker.domain);
}
