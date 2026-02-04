import {
  ADVERTISING_PARAMS,
  AFFILIATE_PARAMS,
  ANALYTICS_PARAMS,
  GENERAL_TRACKING_PARAMS,
  SOCIAL_PARAMS,
  URL_SHORTENER_PARAMS,
  UTM_PARAMS,
} from "@/data/tracking-params";
import { TrackerPurpose, TrackingMethod } from "@/types/tracking-enums";

import type { DetectionResult } from "@/types/detection-result";
import {
  extractTrackingParams,
  hasHashParam,
  hasParamMatch,
  isInternalNavigation,
  isRedirectURL,
  isSafeDomain,
  isSocialDomain,
  notifyServiceWorker,
  shouldIgnoreSameSiteParams,
} from "@/utils/tracking-helpers";
import { findTrackerByUrl } from "@/utils/tracking-url";

/* ---- Tracking Type: 
  Click Based Link Tracking 
---- */

// prevents double events
const processedLinks = new Set<string>();

// Tracking Type: Click Based HREF's
export function detectTrackingLinks(): DetectionResult[] {
  const results: DetectionResult[] = [];
  const links = document.querySelectorAll<HTMLAnchorElement>("a[href]");

  links.forEach((link) => {
    if (link.dataset.trackingAnalyzed) return;
    link.dataset.trackingAnalyzed = "true";

    try {
      const url = new URL(link.href, window.location.href);

      // ignore internal hashes
      if (isInternalNavigation(url, window.location)) {
        return;
      }

      // skip safe/trusted domains
      if (isSafeDomain(url.hostname)) {
        return;
      }

      const params = extractTrackingParams(url.href);
      if (shouldIgnoreSameSiteParams(url, params)) {
        return;
      }

      // check hash fragments
      const hasUTMHash = hasHashParam(url.hash, UTM_PARAMS);
      const hasAnalyticsHash = hasHashParam(url.hash, ANALYTICS_PARAMS);
      const hasSocialHash = hasHashParam(url.hash, SOCIAL_PARAMS);
      const hasAdvertisingHash = hasHashParam(url.hash, ADVERTISING_PARAMS);
      const hasGeneralHash = hasHashParam(url.hash, GENERAL_TRACKING_PARAMS);

      // check tracker domain
      const tracker = findTrackerByUrl(url);
      let purpose: TrackerPurpose | null = tracker?.purpose || null;
      if (
        purpose === TrackerPurpose.AD &&
        Object.keys(params).length === 0 &&
        !hasAdvertisingHash &&
        !isRedirectURL(url)
      ) {
        purpose = null;
      }

      // skip social domains without tracking params
      if (isSocialDomain(url.hostname)) {
        if (Object.keys(params).length === 0 && !hasSocialHash) {
          return;
        }
        purpose = TrackerPurpose.SOCIAL;
      }

      // determine tracking method and purpose
      let method: TrackingMethod | null = null;
      const lower = url.href.toLowerCase();

      if (
        AFFILIATE_PARAMS.some(
          (a) => lower.includes(`${a}=`) || lower.includes(`${a}_`),
        )
      ) {
        method = TrackingMethod.AFFILIATE;
      } else if (URL_SHORTENER_PARAMS.some((s) => url.hostname.includes(s))) {
        method = TrackingMethod.SHORTENER;
      } else if (hasParamMatch(params, ANALYTICS_PARAMS) || hasAnalyticsHash) {
        purpose = TrackerPurpose.ANALYTICS;
      } else if (hasParamMatch(params, SOCIAL_PARAMS) || hasSocialHash) {
        purpose = TrackerPurpose.SOCIAL;
      } else if (hasParamMatch(params, UTM_PARAMS) || hasUTMHash) {
        method = TrackingMethod.URL_DECORATION;
      } else if (
        hasParamMatch(params, ADVERTISING_PARAMS) ||
        hasAdvertisingHash
      ) {
        purpose = TrackerPurpose.AD;
      } else if (
        hasParamMatch(params, GENERAL_TRACKING_PARAMS) ||
        hasGeneralHash
      ) {
        method = TrackingMethod.URL_DECORATION;
      } else if (!method && isRedirectURL(url)) {
        method = TrackingMethod.REDIRECTOR;
      }

      // skip if no tracking detected
      if (!method && !purpose) return;

      // skip if already processed
      const linkKey = String(link.href);
      if (processedLinks.has(linkKey)) return;
      processedLinks.add(linkKey);

      // store all findings
      if (Object.keys(params).length > 0) {
        link.dataset.trackingParams = Object.keys(params).length.toString();
        link.dataset.trackingParamsList = JSON.stringify(params);
      }
      if (method) link.dataset.trackingMethod = method;
      if (purpose) link.dataset.trackerPurpose = purpose;

      // inform service worker
      notifyServiceWorker("LINK_TRACKER_DETECTED", linkKey);

      results.push({
        element: link,
        url: link.href.toString(),
        method,
        purpose,
        params,
      });

      console.log("[LINK]", processedLinks.size, link.href, {
        method,
        purpose,
      });
    } catch (e) {
      console.debug("Invalid Link URL, cannot parse:", e);
    }
  });

  return results;
}
