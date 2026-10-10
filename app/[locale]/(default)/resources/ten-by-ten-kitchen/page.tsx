import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ESTIMATOR_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'What Is a 10×10 Kitchen?',
  description:
    'The industry standard kitchen for comparing prices: two 10-foot walls in an L. Every "from" price on this site is this kitchen in that collection.',
};

export default async function TenByTen({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'What is a 10×10 kitchen', href: '/resources/ten-by-ten-kitchen' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Compare collections', href: '/cabinets/assembled-cabinets', primary: true },
          { label: 'Price my own kitchen', href: ESTIMATOR_HREF },
        ]}
        description="When you see a kitchen price advertised, it's almost always for the same imaginary room: two 10-foot walls in an L, with 20 feet of cabinets. It's the industry's standard for comparing prices, and every “from” price on this site is that kitchen in that collection, so you can compare them fairly. Ours has [X] cabinets where most count 8, and it includes the finished ends, toe kick and fillers that other sellers add back at quote time."
        imageLabel="The 10×10 kitchen, Avon in white"
        kicker="What is a 10×10 kitchen?"
        title="The kitchen behind every price"
      />
      <HomeSection
        description="Numbered left to right so you can match the list to the picture. Built for a 96 in. ceiling with 30 in. wall cabinets set at 84 in. (Cabinet list and count to confirm.)"
        kicker="What's in it"
        tint
        title="Every cabinet in our 10×10"
      >
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-3xl bg-contrast-100">
          <MediaPlaceholder label="Render — the 10×10 kitchen with each cabinet numbered 1–12" />
        </div>
      </HomeSection>
      <DeliveryLadder
        columns={['#', 'Cabinet', 'Qty']}
        rows={[
          ['!1', 'Wall cabinet 18 × 30', '1'],
          ['!2', 'Base cabinet 24', '1'],
          ['!3', 'Sink base 36', '1'],
          ['!4', 'Wall cabinet 30 × 30', '2'],
          ['!5', 'Corner wall 24 × 30', '1'],
          ['!6', 'Corner base 36', '1'],
          ['!7', 'Wall cabinet 12 × 30', '1'],
          ['!8', 'Wall cabinet 30 × 15 (over range)', '1'],
          ['!9', 'Base cabinet 18', '1'],
          ['!10', 'Wall cabinet 36 × 12 (over fridge)', '1'],
          ['!11', 'Base filler 3 in. · wall filler 3 in.', '2'],
          ['!12', 'Finished end panels · toe kick 96 in.', '2 · 1'],
        ]}
        title="The cabinet list"
      />
      <CardsRow
        cards={[
          {
            title: 'Included in the price',
            description:
              'All-plywood box with ¾ in. sides; five-piece solid-wood door frame; soft-close hinges and drawer glides; dovetail drawer boxes; finished end panels and toe kick; fillers to close the corners.',
          },
          {
            title: 'Not included',
            description:
              'Countertops, appliances, handles and knobs, crown molding and light rail, organizers and pull-outs, assembly (on the RTA price), delivery and tax. Installation is never included.',
          },
        ]}
        columns={2}
        hideImages
        tint
        title="What the price covers"
      />
      <DeliveryLadder
        columns={['Line', 'Construction', '10×10 from — RTA', '10×10 from — assembled']}
        description="From-prices are the lowest-priced finish in each line. Every collection card shows its own 10×10 price."
        rows={[
          ['!Star', 'Framed, all-plywood', '$[X]', '$[X]'],
          ['!Prism', 'Framed, painted', '—', '$[X]'],
          ['!Euro Max', 'Frameless, full overlay', '$[X]', '$[X]'],
          ['!Euro Value', 'Frameless, value', '—', '$[X]'],
        ]}
        title="The 10×10, priced across the lines"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about the 10×10',
          items: [
            {
              q: 'Is a 10×10 kitchen small?',
              a: 'It is about average. Most kitchens are between 8×10 and 12×14; the 10×10 is a pricing convention rather than a floor plan, and the estimator scales the price to your room.',
            },
            {
              q: 'Can I buy the 10×10 kitchen as shown?',
              a: 'Yes, in any collection, RTA or assembled. Most people change a few cabinets to fit their room, and a designer does that with you for free.',
            },
            {
              q: "Why do other sites' 10×10 prices look lower?",
              a: 'Usually fewer cabinets, or end panels, toe kick and fillers left out and added at quote. Compare the cabinet list, not just the number.',
            },
            {
              q: 'Does the price include the countertop?',
              a: 'No. Countertops are quoted separately by the square foot; see the countertops page or call us.',
            },
          ],
        }}
      />
      <ClosingBand
        description="Twenty minutes with a tape measure, then the estimator turns the 10×10 into your kitchen."
        primary={{ label: 'Measuring guide', href: '/resources/measuring-guide' }}
        secondary={{ label: 'Price my kitchen', href: ESTIMATOR_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Now measure yours"
      />
    </>
  );
}
