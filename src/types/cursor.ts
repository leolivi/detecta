// Cursor Style type
export const CursorStyles = {
  NORMAL: "auto",
  AD: `url("${chrome.runtime.getURL("img/cursor/ad-cursor.png")}") 16 16, auto`,
  ANALYTICS: `url("${chrome.runtime.getURL(
    "img/cursor/analytics-cursor.png"
  )}") 16 16, auto`,
  SOCIAL: `url("${chrome.runtime.getURL(
    "img/cursor/social-cursor.png"
  )}") 16 16, auto`,
  AFFILIATE: `url("${chrome.runtime.getURL(
    "img/cursor/affiliate-cursor.png"
  )}") 16 16, auto`,
  SHORTENER: `url("${chrome.runtime.getURL(
    "img/cursor/shortener-cursor.png"
  )}") 16 16, auto`,
  REDIRECTOR: `url("${chrome.runtime.getURL(
    "img/cursor/redirector-cursor.png"
  )}") 16 16, auto`,
  URL_DECORATION: `url("${chrome.runtime.getURL(
    "img/cursor/url-decoration-cursor.png"
  )}") 16 16, auto`,
  UNKNOWN: `url("${chrome.runtime.getURL(
    "img/cursor/unknown-cursor.png"
  )}") 16 16, auto`,
} as const;

export type CursorStyles = (typeof CursorStyles)[keyof typeof CursorStyles];
