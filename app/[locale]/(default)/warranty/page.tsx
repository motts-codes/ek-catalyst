import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Warranty',
  description:
    'We build the cabinets, so we stand behind them. What is covered, for how long, what counts as a defect, and how to make a claim.',
};

export default async function Warranty({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'Warranty', href: '/warranty' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Make a claim', href: '/contact', primary: true },
          { label: 'What counts as a defect', href: '#defects' },
        ]}
        description="Because we build the cabinets ourselves, we can stand behind them properly: a [X]-year limited warranty on the box, doors and finish and [X] years on hinges and glides, for the original purchaser, from the day of delivery. Windows, appliances, countertops and hardware carry their own terms, and you'll find all of them on this page, along with the plain-English numbers for what counts as a defect."
        image={{
          src: '/images/pages/warranty/checking-door-line.jpg',
          alt: 'A cabinetmaker checking a painted door on the line',
        }}
        imageLabel="A cabinetmaker checking a door on the line"
        kicker="Warranty"
        title="We made it, so we stand behind it"
      />
      <CategoryPoints
        fine="Terms and durations to be confirmed."
        points={[
          { icon: 'stock', label: 'Photos of the whole item, plus your order number' },
          { icon: 'clock', label: 'Reviewed within 2 business days' },
          { icon: 'truck', label: 'Parts shipped first; a service visit for adjustments' },
          { icon: 'returns', label: 'Three failed replacements = refund' },
        ]}
      />
      <DeliveryLadder
        columns={['Product', 'Duration', 'Covers', 'Remedy', 'Transferable']}
        description="One place for everything you bought from us. The clock starts at delivery."
        footnote="Discontinued styles or finishes are replaced with the closest current equivalent, or the cost of the part is refunded. (To confirm.)"
        rows={[
          [
            '!Cabinets — Star, Prism, Euro Max, Euro Value',
            '[X] years box, door and drawer · [X] years finish',
            'Defects in materials and workmanship: delamination, joint failure, finish peeling or bubbling, warp beyond the tolerances below',
            'Replacement part or cabinet; a service visit for hinge and glide adjustment in the first [X] days',
            'Original purchaser',
          ],
          [
            '!Hinges and drawer glides',
            '[X] years',
            'Mechanical failure in normal use',
            'Replacement hardware',
            'Original purchaser',
          ],
          ['!Closets', '[X] years', 'As cabinets', 'As cabinets', 'Original purchaser'],
          [
            '!Countertops — granite and quartz',
            '[X] years on fabrication · stone per quarry',
            "Seams, cut-outs and polish we did; the quartz manufacturer's warranty on the slab",
            'Repair or re-fabrication of the affected section',
            'Original purchaser',
          ],
          [
            '!Knobs, pulls, sinks, faucets, organizers',
            "Manufacturer's warranty",
            'Per manufacturer',
            'We file it for you',
            'Per manufacturer',
          ],
          [
            '!Windows and doors',
            "Manufacturer's warranty — [X] years, glass [X] years",
            'Per manufacturer',
            'We file it and handle the replacement',
            'Per manufacturer',
          ],
          [
            '!Appliances',
            "Manufacturer's warranty — typically 1 year",
            'Per manufacturer',
            'Manufacturer service; we help you register',
            'Per manufacturer',
          ],
        ]}
        tint
        title="What is covered, and for how long"
      />
      <div id="defects" />
      <DeliveryLadder
        columns={['Door height', 'A defect when the gap exceeds']}
        description="Wood moves with the seasons, so a little movement is normal. These are the limits, measured on a flat surface to the nearest sixteenth. Inside them is normal; outside them is a claim."
        rows={[
          ['!Up to 12 in.', '1/16 in.'],
          ['!13 – 24 in.', '1/8 in.'],
          ['!25 – 41 in.', '3/16 in.'],
          ['!42 – 60 in.', '1/4 in.'],
          ['!Over 60 in.', '5/16 in.'],
        ]}
        title="Door warp, by door height"
      />
      <DeliveryLadder
        columns={['Item', 'Normal, up to']}
        rows={[
          ['!Hairline joint lines on painted doors', '1/16 in.'],
          ['!Molding or panel misalignment', '1/8 in. after adjustment'],
          ['!Colour variation, stained doors', 'Natural grain; see below'],
          ['!Colour shift in direct sun', 'Expected; see cabinet care'],
        ]}
        tint
        title="Finish and joints"
      />
      <CardsRow
        cards={[
          {
            title: 'The room',
            description:
              'Humidity under 20% or over 70% moves wood. Ventilate, wait a season, and most doors settle on their own.',
          },
          {
            title: 'The install',
            description:
              'A cabinet hung out of square pulls the door with it. Re-level from the high point and the door usually follows.',
          },
          {
            title: 'The hinge',
            description:
              'Two minutes with a screwdriver on the side-to-side and in-out screws fixes most "warped" doors. There is a three-minute video in the library.',
          },
        ]}
        hideImages
        kicker="Three reasons doors warp"
        title="And the fix for each"
      />
      <CardsRow
        cards={[
          {
            title: 'Stained maple and birch',
            description:
              'Mineral streaks, subtle grain shifts and a gradual mellowing in colour. Sample doors show the range, and so will your kitchen.',
          },
          {
            title: 'Oak',
            description:
              'Pronounced open grain and colour variation from board to board. It is the reason people choose it.',
          },
          {
            title: 'Painted doors',
            description:
              'Hairline lines at the joints as the frame moves with the seasons (up to 1/16 in.). A slightly different sheen on the centre panel is normal.',
          },
          {
            title: 'Glass doors',
            description:
              'Covered against defects in the frame and finish. Glass is replaced if it arrives broken; ordinary breakage afterwards is not covered.',
          },
        ]}
        columns={4}
        hideImages
        kicker="Not a defect"
        tint
        title="What wood and paint do, by design"
      />
      <Prose
        actions={[{ label: 'Start a claim', href: '/contact', primary: true }]}
        body={[
          'Send us photos of the whole item and your order number through the contact form, or call 860-247-1000. We review every claim within two business days. Replacement parts ship first, a service visit covers hinge and glide adjustments, and if three replacements fail to fix it, we refund the cabinet.',
        ]}
        kicker="Making a claim"
        title="Here's how to start"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about the warranty',
          items: [
            {
              q: 'Does using my own installer affect the warranty?',
              a: "No. The warranty covers the cabinet, not the installation, so damage caused during installation isn't covered.",
            },
            {
              q: 'Is the warranty transferable?',
              a: 'Cabinet, closet and countertop warranties cover the original purchaser. Manufacturer warranties on hardware, windows and appliances follow their own terms.',
            },
            {
              q: 'What if my style or finish has been discontinued?',
              a: 'We replace it with the closest current equivalent, or refund the cost of the part. (To confirm.)',
            },
          ],
        }}
      />
      <FinePrint>
        Durations, coverage and remedies above are the structure of the warranty; the figures marked
        [X] and items marked "to confirm" are to be supplied by Express Kitchens before launch.
      </FinePrint>
      <ClosingBand
        primary={{ label: 'Make a claim', href: '/contact' }}
        showrooms={SHOWROOMS}
        tint
        title="Something not right with your order?"
      />
    </>
  );
}
