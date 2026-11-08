'use client';

import { useEffect, useState } from 'react';

import { PAGE_URL_FIELD, TRACKING_KEYS } from './constants';
import { captureTracking, type StoredTracking } from './store';

// Hidden inputs that attach campaign attribution to a lead: utm_* and click ids from the URL
// the visitor arrived on (kept in sessionStorage by TrackingCapture, which sits in the footer of
// every page, and re-read here), plus the URL of the page the form sits on. Read on the server
// by `extractTracking` in submit-lead.
export function TrackingFields() {
  const [tracking, setTracking] = useState<StoredTracking>({});
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setTracking(captureTracking());
    setPageUrl(window.location.href.slice(0, 500));
  }, []);

  return (
    <>
      {TRACKING_KEYS.map((key) =>
        tracking[key] ? <input key={key} name={key} type="hidden" value={tracking[key]} /> : null,
      )}
      <input name={PAGE_URL_FIELD} type="hidden" value={pageUrl} />
    </>
  );
}

// Renders nothing; stores the landing URL's utm_* / gclid / fbclid so a visitor who arrives on
// any page and later reaches a form still carries the campaign. Mounted once per full page load
// (ad landings are always full loads), so a mount-time capture is enough.
export function TrackingCapture() {
  useEffect(() => {
    captureTracking();
  }, []);

  return null;
}
