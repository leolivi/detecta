export const CursorIcons = {
  AD: chrome.runtime.getURL("img/cursor/ad-cursor.png"),
  ANALYTICS: chrome.runtime.getURL("img/cursor/analytics-cursor.png"),
  SOCIAL: chrome.runtime.getURL("img/cursor/social-cursor.png"),
  AFFILIATE: chrome.runtime.getURL("img/cursor/affiliate-cursor.png"),
  SHORTENER: chrome.runtime.getURL("img/cursor/shortener-cursor.png"),
  REDIRECTOR: chrome.runtime.getURL("img/cursor/redirector-cursor.png"),
  URL_DECORATION: chrome.runtime.getURL("img/cursor/url-decoration-cursor.png"),
  UNKNOWN: chrome.runtime.getURL("img/cursor/unknown-cursor.png"),
} as const;

export type CursorIconType = keyof typeof CursorIcons | null;
