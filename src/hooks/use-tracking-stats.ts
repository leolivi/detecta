import {useEffect, useState} from "react";

interface TrackingStats {
  networkRequests: number;
  urlParameters: number;
  iframes: number;
  pixels: number;
  widgets: number;
  scripts: number;
  links: number;
  hasData: boolean;
  isStale: boolean;
  age: number | null;
}

// tracker chart hook
export function useTrackingStats() {
  const [stats, setStats] = useState<TrackingStats>({
    networkRequests: 0,
    urlParameters: 0,
    iframes: 0,
    pixels: 0,
    widgets: 0,
    scripts: 0,
    links: 0,
    hasData: false,
    isStale: false,
    age: null,
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
          if (isMounted && response) {
            setStats({
              networkRequests: response.networkRequests || 0,
              urlParameters: response.urlParameters || 0,
              iframes: response.iframes || 0,
              pixels: response.pixels || 0,
              widgets: response.widgets || 0,
              scripts: response.scripts || 0,
              links: response.links || 0,
              hasData: response.hasData || false,
              isStale: response.isStale || false,
              age: response.age || null,
            });
          }
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
