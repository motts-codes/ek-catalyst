import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { GlossaryExplorer } from '@/vibes/soul/sections/glossary-explorer';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { LinkCards, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
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
      <LinkCards
        cards={[
          {
            title: 'What are RTA cabinets?',
            description:
              'The flat-pack option: what arrives, how long it takes to build, what you save.',
            href: EXPLAINER_V2_HREF.rta,
            linkLabel: 'Read the explainer',
          },
          {
            title: 'What are assembled cabinets?',
            description: 'Built in our factory, ready to install. Where it fits in your remodel.',
            href: EXPLAINER_V2_HREF.assembled,
            linkLabel: 'Read the explainer',
          },
          {
            title: 'Price my kitchen',
            description: 'A real number for your layout in about two minutes, no quote needed.',
            href: ESTIMATOR_HREF,
            linkLabel: 'Open the estimator',
          },
        ]}
        columns={3}
        kicker="Where next"
        tint
        title="Put the words to work"
      />
    </>
  );
}
