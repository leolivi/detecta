/*
Tracking parameters commonly used for URL decoration and attribution

Source: Generated with AI (Chat GPT), based on common industry patterns 
*/

export const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
];
export const ANALYTICS_PARAMS = [
  // Google Analytics
  "ga",
  "_ga",
  "_gl",
  // Adobe Analytics
  "s_cid",
  "adobe_mc",
  // Piwik/Matomo
  "pk_campaign",
  "pk_kwd",
  "pk_medium",
  "pk_source",
  "pk_content",
  "pk_cid",
  "mtm_campaign",
  "mtm_kwd",
  "mtm_medium",
  "mtm_source",
  "mtm_content",
  "mtm_cid",
  // HubSpot
  "_hsenc",
  "_hsmi",
  "__hssc",
  "__hstc",
  "__hsfp",
  // Mailchimp
  "mc_cid",
  "mc_eid",
  // SendGrid
  "sg_link_id",
  // Vero
  "vero_id",
  "vero_conv",
  // Marketo
  "mkt_tok",
  // Drip
  "__s",
  // Klaviyo
  "_kx",
];

export const SOCIAL_PARAMS = [
  // Facebook/Meta
  "fbclid",
  "fb_action_ids",
  "fb_action_types",
  "fb_source",
  "fb_ref",
  // Instagram
  "igshid",
  "ig_rid",
  // Twitter/X
  "twclid",
  "tw_source",
  // LinkedIn
  "li_fat_id",
  "lipi",
  "licu",
  // TikTok
  "ttclid",
  "tt_medium",
  "tt_content",
  // Snapchat
  "ScCid",
  // Pinterest
  "epik",
];

export const ADVERTISING_PARAMS = [
  // Google Ads & Click IDs
  "gclid",
  "gclsrc",
  "dclid",
  "gbraid",
  "wbraid",
  // Microsoft/Bing
  "msclkid",
  "ms_clkid",
];

export const GENERAL_TRACKING_PARAMS = [
  // Other Common Tracking
  "ref",
  "src",
  "campaign",
  "campaignid",
  "ad_id",
  "ad_name",
  "adgroup",
  "keyword",
  "matchtype",
  "network",
  "device",
  "placement",
  "target",
  "gad_source",
  "gad",
  // Referral/Share Tracking
  "share",
  "shared",
  "shares",
  "si",
  "trk",
  "tracking",
  "trackingid",
];

/*
 Redirector patterns commonly found in redirect chains
  These appear in URL paths or hostnames
*/
export const REDIRECTOR_PARAMS: string[] = [
  "redirect",
  "redir",
  "goto",
  "go",
  "url",
  "destination",
  "dest",
  "out",
  "view",
  "exit",
  "away",
  "link",
  "click",
  "track",
  "forward",
  "target",
  "to",
];

/*
  URL Shortener domains
*/
export const URL_SHORTENER_PARAMS: string[] = [
  // Major platforms
  "bit.ly",
  "goo.gl",
  "t.co",
  "tinyurl.com",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "bit.do",
  "cutt.ly",
  "short.link",
  "rebrand.ly",

  // Additional common shorteners
  "tiny.cc",
  "lnkd.in",
  "fb.me",
  "youtu.be",
  "amzn.to",
  "j.mp",
  "t2m.io",
  "soo.gd",
  "s2r.co",
  "clicky.me",
  "budurl.com",
  "bc.vc",
  "u.to",
  "tr.im",
  "cli.gs",
  "x.co",
  "wp.me",
  "1url.com",
  "v.gd",
];

/*
 Affiliate parameters used for commission tracking
 */
export const AFFILIATE_PARAMS: string[] = [
  // Generic affiliate parameters
  "affiliate",
  "aff",
  "aff_id",
  "affiliate_id",
  "affid",
  "partner",
  "partner_id",
  "ref",
  "referral",
  "associate",
  "associate_id",

  // Amazon
  "tag",
  "ascsubtag",
  "linkCode",
  "linkId",

  // Impact Radius
  "irclickid",
  "irgwc",

  // ShareASale
  "sscid",
  "ssuserid",

  // Commission Junction (CJ)
  "cjevent",

  // Rakuten
  "ranMID",
  "ranSiteID",
  "ranEAID",

  // PartnerStack
  "via",

  // Skimlinks
  "skimlinks",

  // Viglink
  "vglink",

  // Other affiliate networks
  "subid",
  "subid1",
  "subid2",
  "subid3",
  "clickid",
  "afftrack",
];

/* -----
  Known tracker pixel dataset 
----- */

export const TRACKING_PIXEL_KEYWORDS = {
  prefix: ["data:image"],
  includes: [
    "pixel",
    "tracker",
    "tracking",
    "impression",
    "beacon",
    "collect",
    "measure",
    "analytics",
    "event",
    "hit",
    "logger",
  ],
};

/* -----
  Known ad keywords dataset 
----- */

export const AD_KEYWORDS = [
  "ad",
  "ads",
  "advert",
  "advertising",
  "advertisement",
  "doubleclick",
  "adservice",
  "adserver",
  "adtech",
  "adform",
  "adnxs",
  "criteo",
  "outbrain",
  "taboola",
  "promoted",
  "sponsored",
  "campaign",
  "placement",
  "creative",
  "media",
  "banner",
];
