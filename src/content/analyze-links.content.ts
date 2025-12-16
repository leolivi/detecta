import {
  AFFILIATE_PARAMS,
  TRACKING_PARAMS,
  URL_SHORTENER_PARAMS,
} from "@/data/tracking-params";
import {TRACKING_DOMAINS} from "@/data/tracking-domains";
import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";
import {isRedirectURL} from "@/utils/is-redirector";
import {addLinkHoverEffect} from "@/utils/add-link-hover-effect";

// prevents double events
const processedLinks = new Set<string>();

// function to analyze href a tags in the dom
export function analyzeLinks() {
  const links = document.querySelectorAll<HTMLAnchorElement>("a[href]");

  links.forEach((link) => {
    if (link.dataset.trackingAnalyzed) return;
    link.dataset.trackingAnalyzed = "true";

    try {
      const url = new URL(link.href, window.location.href);

      // 1. check Tracking Parameters
      const params = new URLSearchParams(url.search);
      const foundParams: Record<string, string> = {};

      params.forEach((value, key) => {
        if (
          TRACKING_PARAMS.some((p) =>
            key.toLowerCase().startsWith(p.toLowerCase())
          )
        ) {
          foundParams[key] = value;
        }
      });

      // 2. check suspicious Hash Fragments (tracking in #)
      const hasTrackingHash =
        url.hash.length > 1 &&
        TRACKING_PARAMS.some((p) => url.hash.toLowerCase().includes(p));

      // 3. check Tracker Domain
      let trackerPurpose: TrackerPurpose | null = null;
      const trackerInfo = TRACKING_DOMAINS.find((t) => {
        const hostname = url.hostname;
        return (
          hostname === t.domain ||
          hostname.endsWith("." + t.domain) ||
          hostname.includes(t.domain)
        );
      });

      if (trackerInfo) {
        trackerPurpose = trackerInfo.purpose;
        // context-aware filtering: links that cause false positives
        const isSocialDomain = [
          "facebook.com",
          "twitter.com",
          "instagram.com",
          "youtube.com",
          "twitch.tv",
          "linkedin.com",
          "tiktok.com",
          "snapchat.com",
        ].some((d) => url.hostname.includes(d));

        if (isSocialDomain) {
          // if it's a social-domain with NO Tracking Params, skip
          if (Object.keys(foundParams).length === 0 && !hasTrackingHash) {
            return;
          }
          // else mark as social tracker
          trackerPurpose = TrackerPurpose.SOCIAL;
        }
      }

      // 4. determine Tracking Method
      let trackingMethod: TrackingMethod | null = null;

      const isAffiliate = AFFILIATE_PARAMS.some((a) => {
        const lower = url.href.toLowerCase();
        return lower.includes(`${a}=`) || lower.includes(`${a}_`);
      });

      const isShortened = URL_SHORTENER_PARAMS.some((s) =>
        url.hostname.includes(s)
      );

      const isRedirector = isRedirectURL(url);

      if (isAffiliate) {
        trackingMethod = TrackingMethod.AFFILIATE;
      } else if (isShortened) {
        trackingMethod = TrackingMethod.SHORTENER;
      } else if (isRedirector) {
        trackingMethod = TrackingMethod.REDIRECTOR;
      } else if (Object.keys(foundParams).length > 0 || hasTrackingHash) {
        trackingMethod = TrackingMethod.URL_DECORATION;
      }

      // skip if no tracking detected
      const hasTracking = trackingMethod !== null || trackerPurpose !== null;
      if (!hasTracking) return;

      // skip if already processed
      const linkKey = String(link.href);
      if (processedLinks.has(linkKey)) return;
      processedLinks.add(linkKey);

      // store all findings on link
      if (Object.keys(foundParams).length > 0) {
        link.dataset.trackingParams =
          Object.keys(foundParams).length.toString();
        link.dataset.trackingParamsList = JSON.stringify(foundParams);
      }
      if (trackingMethod) {
        link.dataset.trackingMethod = trackingMethod;
      }
      if (trackerPurpose) {
        link.dataset.trackerPurpose = trackerPurpose;
      }

      // add cursor hover effect
      addLinkHoverEffect(link, trackingMethod, trackerPurpose);

      // inform service worker
      chrome.runtime.sendMessage({
        type: "LINK_TRACKER_DETECTED",
        key: link.href,
      });

      console.log("[LINK]", processedLinks.size, link.href, {
        method: trackingMethod,
        purpose: trackerPurpose,
      });
    } catch (e) {
      console.warn("Invalid URL:", e);
    }
  });
}
