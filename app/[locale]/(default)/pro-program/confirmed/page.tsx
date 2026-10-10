import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = { title: 'Application received', robots: { index: false } };

export default async function ProProgramConfirmed({
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
          { label: 'Contractor Program', href: '/pro-program' },
          { label: 'Applied', href: '/pro-program/confirmed' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Shop cabinets', href: '/cabinets/assembled-cabinets', primary: true },
          { label: 'Back to the Pro page', href: '/pro' },
        ]}
        description="Thank you. Your showroom's trade team will call to verify your license and set up your account and tax exemption, usually within [X] business days. Until then you can order at retail pricing, and we'll apply your tier to anything in progress once the account is live."
        kicker="Application received"
        textOnly
        title="Welcome aboard — we'll call to set you up"
      />
    </>
  );
}
