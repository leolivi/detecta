import {useEffect, useState} from "react";

interface TrackerAverage {
  average: number;
  siteCount: number;
}

function computeAverage(stored: unknown): TrackerAverage {
  const history: Array<{total: number}> = Array.isArray(stored) ? stored : [];
  if (history.length === 0) return {average: 0, siteCount: 0};

  const sum = history.reduce((s, e) => s + e.total, 0);
  return {
    average: Math.round(sum / history.length),
    siteCount: history.length,
  };
}

export function useTrackerAverage(): TrackerAverage {
  const [data, setData] = useState<TrackerAverage>({average: 0, siteCount: 0});

  useEffect(() => {
    chrome.storage.session.get("trackerHistory", (result) => {
      setData(computeAverage(result.trackerHistory));
    });

    const listener = (changes: {[key: string]: chrome.storage.StorageChange}, area: string) => {
      if (area === "session" && changes.trackerHistory) {
        setData(computeAverage(changes.trackerHistory.newValue));
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return data;
}
