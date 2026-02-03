import { TRACKER_DOMAIN_EXCLUSIONS } from "@/data/false-positive-list";
import { TRACKER_MAP, type TrackerDomain } from "@/data/tracking-domains";
import type { TrackerPurpose } from "@/types/tracking-enums";

const domainCache = new Map<string, TrackerDomain | null>();

export function findTrackerByUrl(
  urlOrString: string | URL,
  options?: {
    excludeLegitimate?: boolean;
    purposeFilter?: TrackerPurpose[];
  }
): TrackerDomain | null {
  let hostname: string;
  
  try {
    if (typeof urlOrString === "string") {
      if (urlOrString.startsWith("http://") || urlOrString.startsWith("https://")) {
        hostname = new URL(urlOrString).hostname;
      } else {
        hostname = urlOrString;
      }
    } else {
      hostname = urlOrString.hostname;
    }
  } catch {
    const foundTracker = Array.from(TRACKER_MAP.values()).find(t => 
      urlOrString.toString().includes(t.domain)
    );
    return foundTracker || null;
  }

  // cache check
  const cacheKey = `${hostname}:${options?.purposeFilter?.join(",")}`;
  if (domainCache.has(cacheKey)) {
    return domainCache.get(cacheKey)!;
  }

  // check exclusions
  if (options?.excludeLegitimate !== false) {
    if (TRACKER_DOMAIN_EXCLUSIONS.some(
      (d) => hostname === d || hostname.endsWith("." + d)
    )) {
      domainCache.set(cacheKey, null);
      return null;
    }
  }

  // find tracker
  for (const [domain, tracker] of TRACKER_MAP) {
    if (hostname === domain || hostname.endsWith("." + domain)) {
      if (options?.purposeFilter && !options.purposeFilter.includes(tracker.purpose)) {
        continue;
      }
      domainCache.set(cacheKey, tracker);
      return tracker;
    }
  }

  domainCache.set(cacheKey, null);
  return null;
}