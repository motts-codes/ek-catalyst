import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { type CabinetLine } from '@/vibes/soul/sections/cabinet-lines';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Free Door Samples',
  description:
    'Hold a piece of the real door, in the real finish, in your own light. Your first two quarter-door samples are free with code FREESAMPLES.',
};

// One card per collection: the door-sample photo, the collection name and the order button.
function SampleCard({ line }: { line: CabinetLine }) {
  const image = line.hoverImage ?? line.image;

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl border border-contrast-100 bg-white">
      <div className="relative aspect-square bg-contrast-100">
        {image ? (
          <Image
            alt={`${line.name} door sample`}
            className="object-contain p-6"
            fill
            sizes="(min-width: 64rem) 25vw, 50vw"
            src={image.src}
            unoptimized
          />
        ) : (
          <MediaPlaceholder label={`${line.name} sample door`} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold leading-tight">
          {line.name} door sample
        </h3>
        <p className="mt-1 text-sm text-contrast-500">
          Quarter door · first two free with FREESAMPLES
        </p>
        <div className="mt-auto pt-5">
          <ButtonLink
            href={line.orderSampleHref ?? line.href}
            shape="pill"
            size="small"
            variant="primary"
          >
            Order this sample
          </ButtonLink>
        </div>
      </div>
    </li>
  );
}

export default async function Samples({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const lines = await getCabinetLines('assembled');

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'Samples', href: '/samples' },
        ]}
      />
      <PageHero
        actions={[{ label: 'Choose your samples', href: '#collections', primary: true }]}
        description="Screens get colors wrong. We'll mail you a real piece of the door, in the real finish, to hold up in your own kitchen. Your first two are free with code FREESAMPLES."
        image={{
          src: '/images/pages/samples/hero-door-samples-table-2.jpg',
          alt: 'A designer in a red top and a customer at a table, comparing door samples in white, sage, navy and walnut',
        }}
        imageStyle="plain"
        kicker="Door samples"
        title="Hold the real door before you choose it"
      />
      <CategoryPoints
        fine="Extra quarter doors, and half and full doors, are priced per sample."
        points={[
          { icon: 'gift', label: 'First two quarter doors free' },
          { icon: 'tag', label: 'Code FREESAMPLES at checkout' },
        ]}
      />
      <HomeSection
        description="Pick the two you're deciding between."
        id="collections"
        title="Samples by collection"
      >
        {lines.length === 0 ? (
          <p className="text-contrast-500">Samples will appear here as collections are added.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-5 @3xl:grid-cols-3 @5xl:grid-cols-4">
            {lines.map((line) => (
              <SampleCard key={line.entityId} line={line} />
            ))}
          </ul>
        )}
      </HomeSection>
      <Prose
        body={[
          'Add your samples to the cart and use FREESAMPLES at checkout. When they arrive, look at them in morning and evening light, next to your countertop or floor.',
          'Want a second opinion? Bring them to a showroom, or hold them up on a video call with our design team.',
        ]}
        kicker="How samples work"
        tint
        title="Order, hold, decide"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about samples',
          items: [
            {
              q: 'Are the samples really free?',
              a: 'Your first two quarter-door samples are free with the code FREESAMPLES at checkout. Further quarter doors, and all half and full doors, are priced per sample.',
            },
            {
              q: 'What size is a quarter door?',
              a: 'A quarter-door sample is a corner section of the real door, about 6½ by 6½ inches, in the real finish, so you can see the profile, the edge and the color exactly as they are on the full door.',
            },
            { q: 'Do I need to send them back?', a: "No. They're yours to keep." },
            {
              q: 'How long do they take to arrive?',
              a: 'Samples ship from Bristol within [X] days of your order.',
            },
          ],
        }}
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
