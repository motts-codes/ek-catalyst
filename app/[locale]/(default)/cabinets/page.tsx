import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetProgramContentSection } from '@/vibes/soul/sections/cabinet-program-content';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { FeatureRows } from '@/vibes/soul/sections/feature-rows';
import { ProgramCards } from '@/vibes/soul/sections/program-cards';
import { StoryBand } from '@/vibes/soul/sections/story-band';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import {
  ACCESSORIES_BAND,
  ASSEMBLED_LISTING_HREF,
  COMPARISON_COLUMNS,
  COMPARISON_ROWS,
  COST_BAND,
  GLASS_BAND,
  HUB_BUILD_BLOCK,
  HUB_HERO,
  HUB_PROGRAM_CARDS,
  INSTALLER_HREF,
  LINE_CARDS,
  STYLE_ROWS,
} from '~/lib/cabinets/cabinets-hub-content';
import { CODE_PAGE_HERO_IMAGES } from '~/lib/category/category-content';
import {
  ESTIMATOR_HREF,
  FREE_DESIGN_HREF,
  PROGRAM_FOOTNOTE,
  SHOWROOMS,
} from '~/lib/home/home-content';
import { Slot } from '~/lib/makeswift/slot';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Kitchen Cabinets',
  description:
    'Kitchen cabinets in shaker, modern and traditional styles. Framed or frameless, assembled or ready to assemble, from 50,000+ in stock. RTA ships in 2 weeks, assembled in 3.',
};

// The Cabinets hub: the education page between the home page and the two program listings. Not a
// listing — it explains styles, lines and the RTA / assembled decision, then hands off to
// /cabinets/assembled-cabinets and /cabinets/rta-cabinets. Every band is a Makeswift slot with the
// wireframe content as the fallback (lib/cabinets/cabinets-hub-content.ts).
export default async function CabinetsHub({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  // Door tiles under each style come from the live collections where the names match.
  const lines = await getCabinetLines('assembled');
  const styleRows = STYLE_ROWS.map(({ collections, ...row }) => ({
    ...row,
    tiles: collections.map(({ name, label }) => {
      const line = lines.find((candidate) => candidate.name === name);
      const image = line?.hoverImage ?? line?.image;

      return { name: label, href: line?.href ?? ASSEMBLED_LISTING_HREF, image };
    }),
  }));

  return (
    <>
      <Slot
        fallback={
          <StoryBand
            actions={[
              { label: 'Plan my kitchen', href: FREE_DESIGN_HREF, primary: true },
              { label: 'Compare 10×10 prices', href: ESTIMATOR_HREF },
            ]}
            description={HUB_HERO.description}
            headingLevel={1}
            image={CODE_PAGE_HERO_IMAGES.cabinets}
            imageLabel={HUB_HERO.imageLabel}
            kicker={HUB_HERO.kicker}
            note={HUB_HERO.note}
            title={HUB_HERO.title}
          />
        }
        label="Cabinets hero"
        snapshotId="cabinets-hero"
      />

      <Slot
        fallback={
          <FeatureRows
            cta={{ label: 'View all collections', href: ASSEMBLED_LISTING_HREF }}
            description="Most kitchens start with a door, not a collection name. Pick the look you love; each one shows the collections that carry it."
            id="styles"
            rows={styleRows}
            tint
            title="Find your style"
          />
        }
        label="Cabinets find your style"
        snapshotId="cabinets-styles"
      />

      <Slot
        fallback={
          <StoryBand
            actions={GLASS_BAND.actions}
            description={GLASS_BAND.description}
            imageLabel={GLASS_BAND.imageLabel}
            imagePosition="left"
            note={GLASS_BAND.note}
            title={GLASS_BAND.title}
          />
        }
        label="Cabinets glass doors"
        snapshotId="cabinets-glass-doors"
      />

      <Slot
        fallback={
          <CardsRow
            cards={LINE_CARDS}
            columns={4}
            description="Every collection belongs to one of four lines, with 300+ cabinet sizes and types in each door style. The line decides how the cabinet is built; the collection decides the door and color."
            hideImages
            title="What’s behind the door"
          />
        }
        label="Cabinets lines"
        snapshotId="cabinets-lines"
      />

      <Slot
        fallback={
          <ProgramCards
            cards={HUB_PROGRAM_CARDS}
            footnote={PROGRAM_FOOTNOTE}
            helper={{ label: 'Not sure? Talk to a designer →', href: FREE_DESIGN_HREF }}
            tint
          />
        }
        label="Cabinets program cards"
        snapshotId="cabinets-programs"
      />

      <Slot
        fallback={
          <DeliveryLadder
            columns={COMPARISON_COLUMNS}
            footnote={
              <>
                Assembled means the cabinet is built, not installed. Your installer hangs, levels
                and connects it. <a href={INSTALLER_HREF}>Find an installer →</a>
              </>
            }
            rows={COMPARISON_ROWS}
            title="RTA or assembled, side by side"
          />
        }
        label="Cabinets comparison table"
        snapshotId="cabinets-comparison"
      />

      <Slot
        fallback={
          <CabinetProgramContentSection content={{ blocks: [HUB_BUILD_BLOCK] }} divider={false} />
        }
        label="Cabinets construction"
        snapshotId="cabinets-construction"
      />

      <Slot
        fallback={
          <StoryBand
            actions={[
              { label: 'Get a free quote', href: FREE_DESIGN_HREF, primary: true },
              { label: 'Compare 10×10 prices', href: ESTIMATOR_HREF },
            ]}
            description={COST_BAND.description}
            imageLabel={COST_BAND.imageLabel}
            note={COST_BAND.note}
            title={COST_BAND.title}
          />
        }
        label="Cabinets kitchen cost"
        snapshotId="cabinets-cost"
      />

      <Slot
        fallback={
          <StoryBand
            actions={ACCESSORIES_BAND.actions}
            description={ACCESSORIES_BAND.description}
            imageLabel={ACCESSORIES_BAND.imageLabel}
            title={ACCESSORIES_BAND.title}
          />
        }
        label="Cabinets accessories"
        snapshotId="cabinets-accessories"
      />

      <Slot
        fallback={
          <ClosingBand
            primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
            showrooms={SHOWROOMS}
            tint
          />
        }
        label="Cabinets closing"
        snapshotId="cabinets-closing"
      />
    </>
  );
}
