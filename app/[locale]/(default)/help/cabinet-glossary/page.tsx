import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { GlossaryExplorer } from '@/vibes/soul/sections/glossary-explorer';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { EXPLAINER_V2_HREF } from '~/lib/cabinets/explainer-v2-content';
import { ESTIMATOR_HREF } from '~/lib/home/home-content';
import { CABINET_GLOSSARY, CABINET_GLOSSARY_HREF } from '~/lib/pages/cabinet-glossary';

export const metadata: Metadata = {
  title: 'Kitchen cabinet glossary',
  description:
    'Plain-English definitions of kitchen cabinet terms, from RTA and face frames to undermount glides, fillers and overlay doors.',
};

// The glossary: a text hero, then the explorer (sticky search + group pills, accordion groups,
// anchored terms), then three places the words lead.
export default async function CabinetGlossary({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'Cabinet glossary', href: CABINET_GLOSSARY_HREF },
        ]}
      />
      <PageHero
        description="Every term you’ll come across as you plan a kitchen, explained in plain English. If a word on a product page or in a quote doesn’t make sense, it’s here."
        kicker="Help"
        textOnly
        title="Kitchen cabinet glossary"
      />
      <HomeSection tightTop>
        <GlossaryExplorer groups={CABINET_GLOSSARY} />
      </HomeSection>
      <CardsRow
        cards={[
          {
            title: 'What are RTA cabinets?',
            description:
              'The flat-pack option: what arrives, how long it takes to build, what you save.',
            ctaLabel: 'Read the explainer',
            href: EXPLAINER_V2_HREF.rta,
            image: {
              src: '/images/explainers/rta-box-and-cabinet-espresso.jpg',
              alt: 'An opened flat RTA box with its espresso panels, doors and hardware, beside the same cabinet built',
            },
          },
          {
            title: 'What are assembled cabinets?',
            description: 'Built in our factory, ready to install. Where it fits in your remodel.',
            ctaLabel: 'Read the explainer',
            href: EXPLAINER_V2_HREF.assembled,
            image: {
              src: '/images/explainers/assembled-cabinets-espresso.jpg',
              alt: 'A run of built espresso shaker base cabinets, with a tall pantry at one end',
            },
          },
          {
            title: 'Price my kitchen',
            description: 'A real number for your layout in about two minutes, no quote needed.',
            ctaLabel: 'Open the estimator',
            href: ESTIMATOR_HREF,
            image: {
              src: '/images/home/ways/estimator.webp',
              alt: 'A couple at their kitchen island, checking a price range on a phone',
            },
          },
        ]}
        className="bg-[#fdf8f8]"
        columns={3}
        imageStyle="plain"
        kicker="Where next"
        title="Put the words to work"
      />
    </>
  );
}
