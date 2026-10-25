import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { FaqSchema } from '@/vibes/soul/sections/faq/faq-schema';
import { FaqExplorer } from '@/vibes/soul/sections/faq-explorer';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { SHOWROOMS } from '~/lib/home/home-content';
import { FAQ_CLOSING, FAQ_GROUPS, FAQ_HERO, FAQ_META_DESCRIPTION } from '~/lib/pages/faq';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: FAQ_META_DESCRIPTION,
};

// Strips the inline links and [confirm] tags out of an answer for the FAQPage structured data.
const plain = (answer: string) =>
  answer
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s*\[confirm\]/g, '')
    .trim();

// The FAQ: a text hero, the explorer (topics on the left, search and accordion groups on the
// right, every question its own anchor), then the closing band. FAQPage JSON-LD covers every
// question so search engines can show the answers.
export default async function Faq({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const allItems = FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ q: item.q, a: plain(item.a) })),
  );

  return (
    <>
      <FaqSchema faq={{ headline: FAQ_HERO.title, items: allItems }} />
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Support', href: '/support' },
          { label: 'FAQ', href: '/faq' },
        ]}
      />
      <PageHero
        actions={FAQ_HERO.actions}
        description={FAQ_HERO.description}
        image={FAQ_HERO.image}
        imageSize="small"
        imageStyle="plain"
        kicker={FAQ_HERO.kicker}
        title={FAQ_HERO.title}
      />
      <HomeSection tightTop>
        <FaqExplorer groups={FAQ_GROUPS} />
      </HomeSection>
      <ClosingBand
        description={FAQ_CLOSING.description}
        primary={FAQ_CLOSING.primary}
        secondary={FAQ_CLOSING.secondary}
        showrooms={SHOWROOMS}
        tint
        title={FAQ_CLOSING.title}
      />
    </>
  );
}
