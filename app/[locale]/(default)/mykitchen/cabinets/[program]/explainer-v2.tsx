import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetProgramContentSection } from '@/vibes/soul/sections/cabinet-program-content';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import {
  Arrives,
  ExplainerIntro,
  Glossary,
  MoneyOrTime,
  SameCabinet,
  Suits,
  Timeline,
  TwoWays,
} from '@/vibes/soul/sections/explainer/v2';
import { type CabinetProgram } from '~/lib/cabinets/cabinet-lines-data';
import { type ExplainerV2 } from '~/lib/cabinets/explainer-v2-content';
import { Slot } from '~/lib/makeswift/slot';

interface Props {
  program: CabinetProgram;
  content: ExplainerV2;
  /** The Avon 10×10 price in each program, already formatted ("$2,993"), RTA first. */
  avonPrices: [string, string];
  /** The Avon kitchen photo, beside the cost table. */
  avonImage?: { src: string; alt: string };
}

// The v2 explainer, section by section: the question answered, the two ways a cabinet can
// arrive, the same-cabinet reassurance and the build panel, what turns up, the remodel timeline,
// money or time, who it suits, the glossary, the FAQ and a soft next step. Every band is a
// Makeswift slot with the brief's copy as the fallback; the cost table's Avon row is live.
export function ExplainerV2Page({ program, content, avonPrices, avonImage }: Props) {
  const slot = (name: string) => ({
    label: `${program} explainer ${name}`,
    snapshotId: `explainer-${program}-${name}`,
  });
  const costRows = [[`!${content.cost.priceRow}`, ...avonPrices], ...content.cost.rows];

  return (
    <>
      <Slot fallback={<ExplainerIntro {...content.hero} />} {...slot('hero')} />

      <Slot
        fallback={<TwoWays current={program} kicker="The idea" {...content.twoWays} />}
        {...slot('two-ways')}
      />

      <Slot
        fallback={<SameCabinet kicker="Is one better made?" {...content.sameCabinet} />}
        {...slot('same-cabinet')}
      />

      <Slot
        fallback={
          <CabinetProgramContentSection content={{ blocks: [content.build] }} divider={false} />
        }
        {...slot('build')}
      />

      <Slot
        fallback={<Arrives kicker="What turns up at your door" {...content.arrives} />}
        {...slot('arrives')}
      />

      <Slot
        fallback={<Timeline kicker="From delivery to finished kitchen" {...content.timeline} />}
        {...slot('timeline')}
      />

      <Slot
        fallback={
          <MoneyOrTime
            columns={content.cost.columns}
            description={content.cost.description}
            footnote={content.cost.footnote}
            footnoteLink={content.cost.footnoteLink}
            image={avonImage}
            imageLabel="The Avon kitchen the table prices"
            kicker="What the difference costs you"
            rows={costRows}
            title={content.cost.title}
          />
        }
        {...slot('cost')}
      />

      <Slot fallback={<Suits kicker="Which suits you?" {...content.suits} />} {...slot('suits')} />

      <Slot
        fallback={<Glossary id="glossary" kicker="Glossary" {...content.glossary} />}
        {...slot('glossary')}
      />

      <CabinetFaq data={content.faq} />

      <Slot
        fallback={
          <ClosingBand
            description={content.next.description}
            kicker={content.next.kicker}
            phone={null}
            primary={content.next.primary}
            secondary={content.next.secondary}
            title={content.next.title}
          />
        }
        {...slot('next')}
      />
    </>
  );
}
