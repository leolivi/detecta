import {useEffect, useState} from "react";

interface TrackingStats {
  networkRequests: number;
  urlParameters: number;
  iframes: number;
  pixels: number;
  widgets: number;
  scripts: number;
}

export function useTrackingStats() {
  const [stats, setStats] = useState<TrackingStats>({
    networkRequests: 0,
    urlParameters: 0,
    iframes: 0,
    pixels: 0,
    widgets: 0,
    scripts: 0,
  });

  // get data from local storage
  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;
      chrome.runtime.sendMessage(
        {type: "GET_TRACKER_COUNTS", tabId: tab.id},
        (response) => {
          if (isMounted && response) setStats(response);
        }
      );
    };

    loadStats();

    const interval = setInterval(loadStats, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  return stats;
}
