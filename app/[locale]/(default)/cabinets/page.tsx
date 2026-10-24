import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetProgramContentSection } from '@/vibes/soul/sections/cabinet-program-content';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { FeatureRows } from '@/vibes/soul/sections/feature-rows';
import { ProgramSplit } from '@/vibes/soul/sections/program-split';
import { StoryBand } from '@/vibes/soul/sections/story-band';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import {
  ACCESSORIES_BAND,
  ASSEMBLED_LISTING_HREF,
  COMPARISON_COLUMNS,
  COMPARISON_ROWS,
  COST_BAND,
  GLASS_BAND,
  HUB_HERO,
  HUB_WHY_BLOCK,
  INSTALLER_HREF,
  LINE_CARDS,
  LINE_SAMPLE_COLLECTIONS,
  STYLE_ROWS,
} from '~/lib/cabinets/cabinets-hub-content';
import {
  ESTIMATOR_HREF,
  FREE_DESIGN_HREF,
  PROGRAM_CARDS,
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

  type Line = (typeof lines)[number];

  const kitchenOf = (line?: Line) => (line?.image && !line.containCover ? line.image : undefined);
  // A named collection's kitchen; for per-finish lines, the named finish's kitchen.
  const kitchenFrom = (pick?: { name: string; finish?: string }) => {
    const line = lines.find((candidate) => candidate.name === pick?.name);
    const byFinish = pick?.finish ? line?.finishKitchens?.[pick.finish] : undefined;

    return byFinish && line
      ? { src: byFinish, alt: `${line.name} ${pick?.finish}` }
      : kitchenOf(line);
  };

  // Each style's big photo is the kitchen it names, else the first collection that has one, until
  // marketing supplies a dedicated shot.
  const styleRows = STYLE_ROWS.map(({ collections, kitchenFrom: pick, ...row }) => {
    const matched = collections.map(({ name, label }) => ({
      label,
      line: lines.find((candidate) => candidate.name === name),
    }));
    const kitchen = kitchenFrom(pick) ?? matched.find(({ line }) => kitchenOf(line))?.line?.image;

    return {
      ...row,
      image: kitchen,
      tiles: matched.map(({ label, line }) => ({
        name: label,
        href: line?.href ?? ASSEMBLED_LISTING_HREF,
        image: line?.hoverImage ?? line?.image,
      })),
    };
  });

  // Each line card shows a kitchen from one of its collections, with a red shop button.
  const lineCards = LINE_CARDS.map((card) => {
    const image =
      kitchenFrom(LINE_SAMPLE_COLLECTIONS[card.title]) ??
      lines
        .map(kitchenOf)
        .find((kitchen, index) => kitchen && lines[index]?.productLine === card.title);

    return { ...card, image, primary: true };
  });

  return (
    <>
      <Slot
        fallback={
          <StoryBand
            actions={[
              { label: 'Plan my kitchen', href: FREE_DESIGN_HREF, primary: true },
              { label: 'Price my kitchen', href: ESTIMATOR_HREF },
            ]}
            description={HUB_HERO.description}
            headingLevel={1}
            image={HUB_HERO.image}
            imageFit="contain"
            imageFrame="none"
            imageHeight="medium"
            imageLabel={HUB_HERO.imageLabel}
            kicker={HUB_HERO.kicker}
            note={HUB_HERO.note}
            plate={false}
            split="even"
            title={HUB_HERO.title}
          />
        }
        label="Cabinets hero"
        snapshotId="cabinets-hero"
      />

      <Slot
        fallback={
          <FeatureRows
            className="bg-[#fdf8f8]"
            cta={{ label: 'View all collections', href: ASSEMBLED_LISTING_HREF }}
            description="Most kitchens start with a door, not a collection name. Pick the look you love; each one shows the collections that carry it."
            id="styles"
            kicker="Start with the door"
            rows={styleRows}
            stacked
            title="Find your style"
          />
        }
        label="Cabinets find your style"
        snapshotId="cabinets-styles"
      />

      <Slot
        fallback={
          <StoryBand
            description={GLASS_BAND.description}
            image={GLASS_BAND.image}
            imageHeight="medium"
            imageLabel={GLASS_BAND.imageLabel}
            imagePosition="left"
            kicker={GLASS_BAND.kicker}
            plate={false}
            title={GLASS_BAND.title}
          />
        }
        label="Cabinets glass doors"
        snapshotId="cabinets-glass-doors"
      />

      <Slot
        fallback={
          <CardsRow
            cards={lineCards}
            columns={4}
            description="Every collection belongs to one of four lines, with 300+ cabinet sizes and types in each door style. The line decides how the cabinet is built; the collection decides the door and color."
            imageStyle="plain"
            kicker="The four lines"
            title="What’s behind the door"
          />
        }
        label="Cabinets lines"
        snapshotId="cabinets-lines"
      />

      <Slot
        fallback={
          <ProgramSplit
            cards={PROGRAM_CARDS}
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
            kicker="The decision, in one table"
            look="minimal"
            narrow
            rows={COMPARISON_ROWS}
            title="RTA or assembled, side by side"
          />
        }
        label="Cabinets comparison table"
        snapshotId="cabinets-comparison"
      />

      <Slot
        fallback={
          <CabinetProgramContentSection content={{ blocks: [HUB_WHY_BLOCK] }} divider={false} />
        }
        label="Cabinets why Express Kitchens"
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
            image={COST_BAND.image}
            imageLabel={COST_BAND.imageLabel}
            kicker={COST_BAND.kicker}
            note={COST_BAND.note}
            plate={false}
            title={COST_BAND.title}
            tone="red"
          />
        }
        label="Cabinets kitchen cost"
        snapshotId="cabinets-cost"
      />

      <Slot
        fallback={
          <StoryBand
            actions={ACCESSORIES_BAND.actions}
            copyOffset="down"
            description={ACCESSORIES_BAND.description}
            image={ACCESSORIES_BAND.image}
            imageLabel={ACCESSORIES_BAND.imageLabel}
            imagePosition="left"
            kicker={ACCESSORIES_BAND.kicker}
            plate={false}
            title={ACCESSORIES_BAND.title}
          />
        }
        label="Cabinets accessories"
        snapshotId="cabinets-accessories"
      />

      <Slot
        fallback={
          <ClosingBand
            kicker="Ready when you are"
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
