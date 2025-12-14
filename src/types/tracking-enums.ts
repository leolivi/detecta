// Tracking method (Wie wird getrackt?)
export enum TrackingMethod {
  URL_DECORATION = "url_decoration",
  REDIRECTOR = "redirector",
  SHORTENER = "shortener",
  AFFILIATE = "affiliate",
  PIXEL = "pixel",
  IFRAME = "iframe",
  SCRIPT = "script",
  WIDGET = "widget",
  NETWORK_REQUEST = "network_request",
}
// Tracking puropose (Zweck des Trackers)
export enum TrackerPurpose {
  AD = "ad", // Werbung
  ANALYTICS = "analytics", // Analytics
  SOCIAL = "social", // Social Media
  AFFILIATE = "affiliate", // Affiliate Marketing
  UNKNOWN = "unknown",
}
