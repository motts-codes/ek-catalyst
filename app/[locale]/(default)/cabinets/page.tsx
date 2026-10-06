import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

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
  BUILD_POINTS,
  COMPARISON_COLUMNS,
  COMPARISON_ROWS,
  HUB_HERO,
  HUB_PROGRAM_CARDS,
  INSTALLER_HREF,
  LINE_ROWS,
  STYLE_ROWS,
} from '~/lib/cabinets/cabinets-hub-content';
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
    'Find your style, pick a line, then choose assembled or ready to assemble — every cabinet built on the same all-plywood box in Connecticut.',
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
    tiles: collections.map((name) => {
      const line = lines.find((candidate) => candidate.name === name);
      const image = line?.hoverImage ?? line?.image;

      return { name, href: line?.href ?? ASSEMBLED_LISTING_HREF, image };
    }),
  }));

  return (
    <>
      <Slot
        fallback={
          <StoryBand
            actions={[
              { label: 'Plan my kitchen', href: FREE_DESIGN_HREF, primary: true },
              { label: 'Kitchen estimator', href: ESTIMATOR_HREF },
            ]}
            description={HUB_HERO.description}
            headingLevel={1}
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
            description="Most kitchens start with a door style, not a collection name. Pick the look; each one lists the collections that carry it."
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
          <FeatureRows
            description="Every collection belongs to one of four lines. The line sets the construction — framed or frameless, painted or finished; the collection sets the door and the color."
            id="lines"
            rows={LINE_ROWS}
            title="Our cabinet lines"
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
                Assembled means the cabinet box is built — not that it is fitted to your wall.
                Hanging, levelling and connecting the plumbing is your installer&apos;s job either
                way. <a href={INSTALLER_HREF}>Find an installer ↗</a>
              </>
            }
            rows={COMPARISON_ROWS}
            title="RTA or assembled — side by side"
          />
        }
        label="Cabinets comparison table"
        snapshotId="cabinets-comparison"
      />

      <Slot
        fallback={
          <CardsRow
            cards={BUILD_POINTS}
            columns={4}
            description="The construction is the same across all 30+ door styles — what changes is the door and the finish."
            hideImages
            tint
            title="How every cabinet is built"
          />
        }
        label="Cabinets construction"
        snapshotId="cabinets-construction"
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
