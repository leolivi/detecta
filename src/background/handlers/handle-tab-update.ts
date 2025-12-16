import {TRACKING_PARAMS} from "@/data/tracking-params";

interface HandleTabRequests {
  tabId: number;
  urlString: string;
  urlParamsCache: Map<number, Set<string>>;
  onParamsDetected: (params: string[]) => void;
}

// function to handle url tracking params
export function handleTabRequests({
  tabId,
  urlString,
  urlParamsCache,
  onParamsDetected,
}: HandleTabRequests): void {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    return;
  }

  const params = url.searchParams;
  const foundParams: string[] = [];

  // check if there are params found
  for (const key of params.keys()) {
    if (TRACKING_PARAMS.some((prefix) => key.startsWith(prefix))) {
      foundParams.push(key);
    }
  }

  if (foundParams.length === 0) return;

  // set tabId if none is already set
  let paramsSet = urlParamsCache.get(tabId);
  if (!paramsSet) {
    paramsSet = new Set();
    urlParamsCache.set(tabId, paramsSet);
  }

  let changed = false;

  // increment in memory counter of params
  for (const param of foundParams) {
    if (!paramsSet.has(param)) {
      paramsSet.add(param);
      changed = true;
    }
  }

  if (!changed) return;

  onParamsDetected(Array.from(paramsSet));
}
