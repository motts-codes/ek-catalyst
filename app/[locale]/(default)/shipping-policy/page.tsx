import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Shipping, Delivery & Pickup',
  description:
    'How each thing you buy gets to you, what it costs and how long it takes, from our Bristol factory. Free shipping over $2,500; free pickup on any order.',
};

export default async function ShippingPolicy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Support', href: '/support' },
          { label: 'Shipping & pickup', href: '/shipping-policy' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'What shipping costs', href: '#cost', primary: true },
          { label: 'Delivery day, step by step', href: '#delivery-day' },
        ]}
        description="Everything you buy from us leaves our own factory in Bristol, Connecticut, not a warehouse somewhere, so we can tell you exactly how it gets to you. Cabinets ship to your curb or you collect them; windows and appliances are pickup only. The lead times on this page are from checkout to your door, not to the ship date, so you can plan around them."
        imageLabel="A pallet of wrapped cabinets coming off the truck in a driveway"
        kicker="Shipping, delivery & pickup"
        title="How your order gets to you"
      />
      <CategoryPoints
        fine="Thresholds, fees and windows to be confirmed."
        points={[
          { icon: 'truck', label: 'Free shipping on orders over $2,500' },
          { icon: 'stock', label: 'Free pickup from Bristol, any order' },
          { icon: 'returns', label: 'Free damage protection on every delivery' },
          { icon: 'clock', label: '30 days to report concealed damage' },
        ]}
      />
      <DeliveryLadder
        columns={['Category', 'Make & ship', 'Delivery', 'Total to your door']}
        description="The total to your door is the make-and-ship lead time plus 7–10 days of transit, depending on your distance from Connecticut. If something is out of stock we tell you before you pay, and you choose whether to ship the rest now, wait for everything together, or swap. Installation is not included on anything."
        footnote="Lead times are per line from the product data; transit bands are estimates to be confirmed."
        rows={[
          ['!RTA cabinets', '2 weeks', '+ 7–10 days transit', '3 – 3½ weeks'],
          ['!Assembled cabinets', '3 weeks', '+ 7–10 days transit', '4 – 4½ weeks'],
          ['!Closets', 'From stock', '+ 7–10 days transit', '1 – 2 weeks'],
          ['!Handles, sinks, faucets, accessories', '1–2 days', 'FedEx / UPS Ground', '3 – 7 days'],
          ['!Windows', '—', 'Pickup at the Bristol factory outlet', 'Ready in 2 days'],
          ['!Appliances', '—', 'Pickup at the Bristol factory outlet', 'Ready in 2 days'],
          ['!Countertops', 'Quoted to your kitchen', 'Delivered within Connecticut', 'As quoted'],
        ]}
        tint
        title="How you get each thing"
      />
      <DeliveryLadder
        columns={['Order total', 'Shipping']}
        description="Free shipping applies to orders of $2,500 or more after discounts, delivered curbside by freight to a standard-access address in the contiguous 48 states. It excludes pickup-only items, clearance and special orders. Trim over 84 in. and oversized pallets carry a $[X] minimum."
        rows={[
          ['!Under $[X]', '$[X]'],
          ['!$[X] – $2,499', '$[X]'],
          ['!$2,500 and over', 'Free'],
          ['!Pickup from Bristol, any total', 'Free'],
        ]}
        title="What shipping costs"
      />
      <div id="cost" />
      <DeliveryLadder
        columns={['Your address', 'Delivery', 'Fee']}
        description="Tell us at checkout if your street is one of the second two. Finding out on delivery day costs everyone a second trip."
        rows={[
          ['!A 53-ft truck can reach the driveway or curb', 'Curbside, lift-gate', 'Included'],
          [
            '!Narrow road, no turning, gated community, steep drive',
            'Smaller truck, arranged with you',
            '$[X]',
          ],
          ['!Ferry, island, no vehicle access', 'Call us before you order', 'Quoted'],
        ]}
        tint
        title="Where the truck can go"
      />
      <div id="delivery-day" />
      <CardsRow
        cards={[
          {
            title: '1 · We call to book',
            description:
              'When your order is ready we call to agree a day. An adult (18 or over) needs to be there to sign.',
          },
          {
            title: '2 · The night before',
            description:
              'You get a text with your delivery window: up to eight hours for freight, narrower for our own trucks.',
          },
          {
            title: '3 · 30–60 minutes out',
            description:
              'The driver calls. The truck delivers to your curb or driveway with a lift-gate; from there the pallet is yours to unload. Cabinets can weigh over 100 lb, so have a helper ready.',
          },
          {
            title: '4 · Before the driver leaves',
            description:
              "Count the pieces and check every box for visible damage. Note anything on the driver's paperwork (the Bill of Lading), have them sign it, and keep your copy.",
          },
        ]}
        columns={4}
        hideImages
        kicker="Delivery day"
        title="What happens, in order"
      />
      <Prose
        body={[
          "A few things look like packaging and aren't: finished end panels packed flat under cardboard at the bottom of the pallet, trim, fillers and toe kick arriving as a separate bundle, and hardware bags taped inside the cabinets. Check the pallet against your packing list before anything goes in the recycling.",
        ]}
        kicker="Before you throw anything away"
        tint
        title="Things people mistake for packaging"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about delivery',
          items: [
            {
              q: 'Do I need to be home?',
              a: 'Yes. Someone aged 18 or over needs to be there to accept and sign for the delivery.',
            },
            {
              q: 'Can I pick up instead?',
              a: "Yes. Any cabinet order can be collected from the Bristol factory outlet, Monday to Friday 8–6 and Saturday 8–5, and pickup is always free. We'll tell you when it's ready.",
            },
            {
              q: 'What if it arrives damaged?',
              a: "Don't refuse it. Note the damage on the Bill of Lading, have the driver sign it, keep your copy and call (860) 247-1000. You have 30 days to report concealed damage, and we replace damaged items free.",
            },
          ],
        }}
      />
      <FinePrint>
        Effective [date]. Thresholds, fees and delivery windows are to be confirmed by Express
        Kitchens before launch.
      </FinePrint>
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
