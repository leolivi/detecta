import {REDIRECTOR_PARAMS} from "@/data/tracking-params";

// function to check if a URL is a redirector URL
export function isRedirectURL(url: URL) {
  const params = new URLSearchParams(url.search);

  // check if any URL parameter contains a redirect keyword
  for (const [key, value] of params.entries()) {
    const keyLower = key.toLowerCase();

    // extract redirector keywords from parameter names
    if (
      REDIRECTOR_PARAMS.some(
        (r) => keyLower === r || keyLower.startsWith(r + "_")
      )
    ) {
      return true;
    }

    // if value looks like a URL, check it for redirector keywords
    if (
      value &&
      (value.startsWith("http://") || value.startsWith("https://"))
    ) {
      return true;
    }
  }
}
