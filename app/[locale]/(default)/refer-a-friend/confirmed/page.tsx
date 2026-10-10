import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = { title: 'Your referral link', robots: { index: false } };

export default async function ReferralConfirmed({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Refer a friend', href: '/refer-a-friend' },
          { label: 'Your link', href: '/refer-a-friend/confirmed' },
        ]}
      />
      <PageHero
        actions={[{ label: 'Back to the home page', href: '/', primary: true }]}
        description="Thank you. Your personal referral link is on its way to your inbox, and if you gave us your friend's email we've sent it to them too. Share it as often as you like; every friend who orders earns you a reward when their kitchen ships."
        kicker="You're in"
        textOnly
        title="Check your email for your link"
      />
    </>
  );
}
