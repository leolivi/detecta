export const FALSE_POSITIVE_EXCLUSION_LIST = [
  "recaptcha",
  "captcha",
  "about:blank",
  "data:image",
  "localhost",
  "blob:",
  
  // CDN & Library domains
  "jquery.com",
  "jsdelivr.net",
  "unpkg.com",
  "cdnjs.cloudflare.com",
  "bootstrapcdn.com",
  "cloudflare.com/ajax",
  "googleapis.com/ajax",
  
  // Consent & Cookie managers (not trackers)
  "consentmanager.net",
  "cookiebot.com",
  "onetrust.com",
  "trustarc.com",
];

export const SAFE_DOMAINS = [
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "stackoverflow.com",
  "mozilla.org",
  "wikipedia.org",
  "npmjs.com",
  "vercel.app",
  "netlify.app",
];

export const TRACKER_DOMAIN_EXCLUSIONS = [
  "chromewebstore.google.com",
  "play.google.com",
  "apps.apple.com",
  "drive.google.com",
  "docs.google.com",
  "mail.google.com",
];

export const IS_SOCIAL_DOMAIN = [
  "facebook.com",
  "twitter.com",
  "instagram.com",
  "youtube.com",
  "twitch.tv",
  "linkedin.com",
  "tiktok.com",
  "snapchat.com",
];

export const COOKIE_BANNER_KEYWORDS = [
  "cookie",
  "consent",
  "gdpr",
  "euconsent",
  "cookiebanner",
  "tcf",
];
