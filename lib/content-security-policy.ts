import builder from 'content-security-policy-builder';

const makeswiftEnabled = !!process.env.MAKESWIFT_SITE_API_KEY;

const makeswiftBaseUrl =
  process.env.NEXT_PUBLIC_MAKESWIFT_APP_ORIGIN ??
  process.env.MAKESWIFT_APP_ORIGIN ??
  'https://app.makeswift.com';

// The Makeswift builder loads the storefront in an iframe; nothing else may frame it.
const frameAncestors = makeswiftEnabled ? makeswiftBaseUrl : "'none'";

// Keyword sources must be quoted ('self', 'none'); an unquoted `self` is read as a hostname and
// the directive silently does nothing (EK security audit, 27 Nov 2026).
//
// This is the part of a CSP that works without nonces. A script-src / default-src policy needs a
// per-request nonce on every inline script Next.js and Makeswift emit, which forces every page to
// render dynamically (no static shell / PPR); that is a separate project, and should start as
// Content-Security-Policy-Report-Only with a reporting endpoint.
export const cspHeader = builder({
  directives: {
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: [frameAncestors],
  },
});
