import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {TRACKING_PARAMS} from "@/data/tracking-params";
import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import {AFFILIATE_PARAMS, URL_SHORTENER_PARAMS} from "@/data/tracking-params";
import {
  extractTrackingParams,
  isRedirectURL,
  notifyServiceWorker,
} from "@/utils/tracking-helpers";
import type {DetectionResult} from "@/types/detection-result";
import {IS_SOCIAL_DOMAIN} from "@/data/false-positive-list";

/* ---- Tracking Type: 
  Click Based Link Tracking 
---- */

// prevents double events
const processedLinks = new Set<string>();

/* ---- Tracking Type: Click Based HREF's ---- */
export function detectTrackingLinks(): DetectionResult[] {
  const results: DetectionResult[] = [];
  const links = document.querySelectorAll<HTMLAnchorElement>("a[href]");

  links.forEach((link) => {
    if (link.dataset.trackingAnalyzed) return;
    link.dataset.trackingAnalyzed = "true";

    try {
      const url = new URL(link.href, window.location.href);
      const params = extractTrackingParams(url.href);

      // check hash fragments
      const hasTrackingHash =
        url.hash.length > 1 &&
        TRACKING_PARAMS.some((p) => url.hash.toLowerCase().includes(p));

      // check tracker domain
      let purpose: TrackerPurpose | null = null;
      const trackerInfo = TRACKING_DOMAINS.find((t) => {
        const hostname = url.hostname;
        return (
          hostname === t.domain ||
          hostname.endsWith("." + t.domain) ||
          hostname.includes(t.domain)
        );
      });

      if (trackerInfo) {
        purpose = trackerInfo.purpose;

        // skip social domains without tracking params
        IS_SOCIAL_DOMAIN.some((d) => url.hostname.includes(d));

        // if it's a social-domain with NO Tracking Params, skip
        if (
          IS_SOCIAL_DOMAIN &&
          Object.keys(params).length === 0 &&
          !hasTrackingHash
        ) {
          return;
        }
        //  else mark as social tracker
        if (IS_SOCIAL_DOMAIN) purpose = TrackerPurpose.SOCIAL;
      }

      // determine tracking method
      let method: TrackingMethod | null = null;
      const lower = url.href.toLowerCase();

      if (
        AFFILIATE_PARAMS.some(
          (a) => lower.includes(`${a}=`) || lower.includes(`${a}_`)
        )
      ) {
        method = TrackingMethod.AFFILIATE;
      } else if (URL_SHORTENER_PARAMS.some((s) => url.hostname.includes(s))) {
        method = TrackingMethod.SHORTENER;
      } else if (Object.keys(params).length > 0 || hasTrackingHash) {
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
        method: TrackingMethod,
        purpose: TrackerPurpose,
      });
    } catch (e) {
      console.warn("Invalid Link URL, cannot parse:", e);
    }
  });

  return results;
}
