import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
import { SITEMAP } from '~/lib/pages/sitemap';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Every page on the Express Kitchens site, in one place.',
};

export default async function Sitemap({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Sitemap', href: '/sitemap' }]} />
      <PageHero
        description="Everything on the site, grouped the way the menu groups it. If you can't find what you're looking for, the search at the top of every page looks through products and pages alike."
        kicker="Sitemap"
        textOnly
        title="Every page, in one place"
      />
      <HomeSection compact>
        <div className="grid gap-x-8 gap-y-10 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
          {SITEMAP.map((group) => (
            <section aria-labelledby={`sitemap-${group.title}`} key={group.title}>
              <h2 className="font-heading text-lg font-semibold" id={`sitemap-${group.title}`}>
                {group.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-contrast-500 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </HomeSection>
    </>
  );
}
