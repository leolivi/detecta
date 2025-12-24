export interface TrackerCounts {
  networkRequests?: number;
  urlParameters?: number;
  pixels?: number;
  iframes?: number;
  scripts?: number;
  widgets?: number;
}

// calculate the total number of embedded trackers
export function getTotalTrackers(counts: TrackerCounts): number {
  return (
    (counts.networkRequests ?? 0) +
    (counts.urlParameters ?? 0) +
    (counts.pixels ?? 0) +
    (counts.iframes ?? 0) +
    (counts.scripts ?? 0) +
    (counts.widgets ?? 0)
  );
}
