import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { LegalDocument } from '@/vibes/soul/sections/page-kit/legal';
import { TERMS_SECTIONS } from '~/lib/pages/legal';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The terms for using this site and ordering from Express Kitchens.',
};

export default async function Terms({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Terms', href: '/terms' }]} />
      <PageHero
        description="These are the terms for using this site and ordering from it. The customer-facing versions of the delivery, returns and warranty terms are on their own pages; this page is the legal text that sits behind them."
        kicker="Terms"
        textOnly
        title="Terms of use"
      />
      <LegalDocument sections={TERMS_SECTIONS} updated="[date]" />
    </>
  );
}
