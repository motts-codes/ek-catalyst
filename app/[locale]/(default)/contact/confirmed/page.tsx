import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = { title: 'Message sent', robots: { index: false } };

export default async function ContactConfirmed({
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
          { label: 'Contact', href: '/contact' },
          { label: 'Sent', href: '/contact/confirmed' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Back to the home page', href: '/', primary: true },
          { label: 'Find a showroom', href: '/showrooms' },
        ]}
        description="Thank you. Your message is with the right person and you'll hear back within one business day. If it's urgent in the meantime, call or text 860-247-1000 — someone picks up 24/7."
        kicker="Message sent"
        textOnly
        title="We've got it"
      />
    </>
  );
}
