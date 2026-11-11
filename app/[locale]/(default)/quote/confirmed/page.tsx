import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = { title: 'Quote request received', robots: { index: false } };

export default async function QuoteConfirmed({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Quote requested', href: '/quote/confirmed' }]} />
      <PageHero
        actions={[
          { label: 'Back to the home page', href: '/', primary: true },
          { label: 'Call 860-247-1000', href: 'tel:+18602471000' },
        ]}
        description="Thank you. Your request is with the right team and we get back to you with a price within 1 business day. If you'd rather talk it through sooner, call or text 860-247-1000 and someone will pick it up with you."
        kicker="Request received"
        textOnly
        title="Your quote is on its way"
      />
    </>
  );
}
