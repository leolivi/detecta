export interface TrackerCounts {
  networkRequests?: number;
  urlParameters?: number;
  pixels?: number;
  iframes?: number;
  scripts?: number;
  widgets?: number;
  links?: number;
}

/**
 * Calculate the total number of trackers from any partial object of tracker counts.
 * Undefined values default to 0, ensuring robustness.
 */
export function getTotalTrackers(counts: TrackerCounts): number {
  return (
    (counts.networkRequests ?? 0) +
    (counts.urlParameters ?? 0) +
    (counts.pixels ?? 0) +
    (counts.iframes ?? 0) +
    (counts.scripts ?? 0) +
    (counts.widgets ?? 0) +
    (counts.links ?? 0)
  );
}
