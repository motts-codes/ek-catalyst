import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { KitchenEstimator } from '@/vibes/soul/sections/kitchen-estimator';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { FALLBACK_RTA_RATIO } from '~/lib/estimator/config';
import { priceBookFromCollections } from '~/lib/estimator/estimate';
import { submitEstimateLead } from '~/lib/forms/submit-lead';
import { FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Kitchen Estimator — a real number in 2 minutes',
  description:
    'Four short steps: layout, measurements, package, estimate. A price range for your kitchen, never hidden behind an email.',
};

const toNumber = (price?: string) => Number((price ?? '').replace(/[^0-9.]/g, ''));

export default async function Calculator({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  // The price book comes from the live collections: their 10×10 prices set the package bands, and
  // Avon's RTA-vs-assembled prices set the RTA saving. See docs/ESTIMATOR-LOGIC.md.
  const [assembled, rta] = await Promise.all([
    getCabinetLines('assembled'),
    getCabinetLines('rta'),
  ]);
  const avonAssembled = toNumber(assembled.find((l) => l.name === 'Avon')?.price);
  const avonRta = toNumber(rta.find((l) => l.name === 'Avon')?.price);
  const rtaRatio = avonAssembled > 0 && avonRta > 0 ? avonRta / avonAssembled : FALLBACK_RTA_RATIO;
  const book = priceBookFromCollections(
    assembled.map((l) => toNumber(l.price)),
    rtaRatio,
  );

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Explore', href: '/mykitchen' },
          { label: 'Estimator', href: '/mykitchen/price-my-kitchen' },
        ]}
      />
      <PageHero
        description="Tell us the shape of your kitchen, how long the walls are and what you'd like in it, and you'll have a real price range in about two minutes, worked out from the same prices you'll see on our collection pages. There's nothing to sign up for and the number is never hidden behind an email."
        kicker="Kitchen estimator"
        textOnly
        title="A real number, in two minutes"
      />
      <HomeSection compact tint>
        <KitchenEstimator
          book={book}
          emailAction={submitEstimateLead}
          links={{
            design: FREE_DESIGN_HREF,
            cabinets: '/cabinets/assembled-cabinets',
            samples: SAMPLES_HREF,
          }}
        />
      </HomeSection>
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
