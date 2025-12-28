import {AlertCircle, RefreshCw} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "./alert";
import {Button} from "../button/button";
import {Spinner} from "../spinner/spinner";

interface ChartAlertProps {
  hasData: boolean;
  isStale: boolean;
  age: number | null;
  isRefreshing?: boolean;
  onRefresh?: (loading: boolean) => void;
}

export function ChartAlert({
  hasData,
  isStale,
  age,
  isRefreshing = false,
  onRefresh,
}: ChartAlertProps) {
  // function to refresh current tab
  const handleRefresh = async () => {
    onRefresh?.(true);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      onRefresh?.(false);
      return;
    }

    // listener for tab updates
    const listener: Parameters<typeof chrome.tabs.onUpdated.addListener>[0] = (
      tabId,
      changeInfo
    ) => {
      if (tabId === tab.id && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        // wait until data is fetched
        setTimeout(() => {
          onRefresh?.(false);
        }, 1000);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    // timeout in case something goes wrong
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      onRefresh?.(false);
    }, 15000);

    chrome.tabs.reload(tab.id);
  };

  const formatAge = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor((seconds % 3600) / 60);
    const hours = Math.floor(seconds / 3600);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}${
        minutes > 0 ? ` ${minutes} minute${minutes > 1 ? "s" : ""}` : ""
      }`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    return `${seconds} second${seconds > 1 ? "s" : ""}`;
  };

  // UI if no data at all -> service worker was asleep
  if (!hasData) {
    return (
      <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">
          No Tracking Data Available
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between text-red-800">
          <span>
            The tracking scanner may have been inactive during page load. Please
            refresh to get current data.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="ml-4 border-red-600 hover:bg-red-100"
          >
            {isRefreshing ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // UI if Data exists but is stale
  if (isStale && age) {
    return (
      <Alert
        variant="destructive"
        className="mb-4 border-yellow-500 bg-yellow-50"
      >
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">Outdated Data</AlertTitle>
        <AlertDescription className="flex items-center justify-between text-yellow-800">
          <span>
            This data is {formatAge(age)} old. Refresh for current tracking
            information.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="ml-4 border-yellow-600 hover:bg-yellow-100"
          >
            {isRefreshing ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
}
