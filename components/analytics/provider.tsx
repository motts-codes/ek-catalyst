'use client';

import { useConsentManager } from '@c15t/nextjs/client';
import { PropsWithChildren, useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { Analytics } from '~/lib/analytics';
import { GoogleAnalyticsProvider } from '~/lib/analytics/providers/google-analytics';
import { AnalyticsProvider as AnalyticsProviderLib } from '~/lib/analytics/react';
import { getConsentCookie } from '~/lib/consent-manager/cookies/client';

import { WebAnalyticsFragment } from './fragment';

interface Props {
  channelId: number;
  isCookieConsentEnabled: boolean;
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null;
}

const getConsent = () => {
  const consentCookie = getConsentCookie();

  if (!consentCookie) {
    return null;
  }

  return {
    functionality: consentCookie['c.functionality'],
    marketing: consentCookie['c.marketing'],
    measurement: consentCookie['c.measurement'],
    necessary: consentCookie['c.necessary'],
  };
};

const getAnalytics = ({ channelId, isCookieConsentEnabled, settings }: Props): Analytics | null => {
  if (settings?.webAnalytics?.ga4?.tagId && channelId) {
    const googleAnalytics = new GoogleAnalyticsProvider({
      gaId: settings.webAnalytics.ga4.tagId,
      consentModeEnabled: isCookieConsentEnabled,
      developerId: 'dMjk3Nj',
      getConsent,
    });

    return new Analytics({
      channelId,
      providers: [googleAnalytics],
    });
  }

  return null;
};

export function AnalyticsProvider({
  channelId,
  isCookieConsentEnabled,
  settings,
  children,
}: PropsWithChildren<Props>) {
  const { consents, hasConsented } = useConsentManager();
  const prevConsentsRef = useRef<string | null>(null);

  const analytics = getAnalytics({
    channelId,
    isCookieConsentEnabled,
    settings,
  });

  // Tell the providers whenever the shopper's recorded choice changes (Accept All, Reject All,
  // or a later edit). Read from c15t's state, not the consent cookie: c15t updates its state
  // before it persists the cookie, so a cookie read at this moment can still be the old choice,
  // and the first Accept would never reach Google Analytics (whose tag waits for it).
  useEffect(() => {
    if (!isCookieConsentEnabled || !analytics || !hasConsented()) {
      return;
    }

    const current = {
      functionality: consents.functionality,
      marketing: consents.marketing,
      measurement: consents.measurement,
      necessary: consents.necessary,
    };
    const key = JSON.stringify(current);

    if (prevConsentsRef.current !== key) {
      prevConsentsRef.current = key;
      analytics.consent.consentUpdated(current);
    }
  }, [isCookieConsentEnabled, analytics, consents, hasConsented]);

  return <AnalyticsProviderLib analytics={analytics ?? null}>{children}</AnalyticsProviderLib>;
}
