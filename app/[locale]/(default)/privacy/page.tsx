import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { LegalDocument } from '@/vibes/soul/sections/page-kit/legal';
import { PRIVACY_SECTIONS } from '~/lib/pages/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What Express Kitchens collects, why, and how it is protected.',
};

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Privacy', href: '/privacy' }]} />
      <PageHero
        description="This page sets out what we collect when you use the site, visit a showroom or contact us, what we do with it, and the choices you have. In short: we use your details to fulfil your order and, only if you ask us to, to keep in touch. We never sell your information."
        kicker="Privacy"
        textOnly
        title="Privacy policy"
      />
      <LegalDocument sections={PRIVACY_SECTIONS} updated="[date]" />
    </>
  );
}
