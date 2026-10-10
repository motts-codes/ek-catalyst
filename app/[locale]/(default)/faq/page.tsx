import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { FAQ_GROUPS } from '~/lib/pages/faq';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers about ordering, delivery and pickup, RTA versus assembled, installation, materials, measuring, samples, returns and damage claims.',
};

export default async function Faq({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Support', href: '/support' },
          { label: 'FAQ', href: '/faq' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Call or text 860-247-1000', href: 'tel:+18602471000', primary: true },
          { label: 'Send us a message', href: '/contact' },
        ]}
        description="Most of what people ask us before and after they order is answered here, from how delivery works to what to do if a box arrives damaged. Pick a topic below, and if your question isn't covered, call or text us and a real person will answer."
        kicker="Help"
        textOnly
        title="Questions, answered"
      />
      <HomeSection compact tint>
        <nav aria-label="FAQ topics">
          <ul className="flex flex-wrap gap-2.5">
            {FAQ_GROUPS.map((group) => (
              <li key={group.id}>
                <Link
                  className="inline-flex items-center rounded-full border border-contrast-200 bg-white px-4 py-2 text-sm font-medium text-contrast-500 transition-colors hover:border-foreground hover:text-foreground"
                  href={`#${group.id}`}
                >
                  {group.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </HomeSection>
      {FAQ_GROUPS.map((group) => (
        <div className="scroll-mt-24" id={group.id} key={group.id}>
          <CabinetFaq data={{ headline: group.title, items: group.items }} />
        </div>
      ))}
      <ClosingBand
        description="If it isn't answered above, tell us what you're trying to do and we'll point you the right way."
        primary={{ label: 'Send us a message', href: '/contact' }}
        secondary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Still have a question?"
      />
    </>
  );
}
