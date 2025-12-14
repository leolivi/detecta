import {TRACKING_PARAMS} from "../data/tracking-params";

interface CheckUrlTrackingParamsArgs {
  tabId: number;
  urlString: string;
  urlParamsCache: Map<number, Set<string>>;
  onParamsDetected: (params: string[]) => void;
}

export function checkUrlTrackingParams({
  tabId,
  urlString,
  urlParamsCache,
  onParamsDetected,
}: CheckUrlTrackingParamsArgs): void {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    return;
  }

  const params = url.searchParams;
  const foundParams: string[] = [];

  for (const key of params.keys()) {
    if (TRACKING_PARAMS.some((prefix) => key.startsWith(prefix))) {
      foundParams.push(key);
    }
  }

  if (foundParams.length === 0) return;

  let paramsSet = urlParamsCache.get(tabId);
  if (!paramsSet) {
    paramsSet = new Set();
    urlParamsCache.set(tabId, paramsSet);
  }

  let changed = false;

  for (const param of foundParams) {
    if (!paramsSet.has(param)) {
      paramsSet.add(param);
      changed = true;
    }
  }

  if (!changed) return;

  onParamsDetected(Array.from(paramsSet));
}
