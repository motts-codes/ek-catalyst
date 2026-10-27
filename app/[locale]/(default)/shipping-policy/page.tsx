import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FinePrint, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ShippingMap } from '@/vibes/soul/sections/shipping-map';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { doorRange, SHIP_CATEGORIES } from '~/lib/pages/shipping';
import { directionsHref, getShowroom } from '~/lib/pages/showrooms';

const DELIVERY_CELL = {
  pickup: 'Pickup at the Bristol factory outlet',
  zone: 'Within the Connecticut delivery zone',
  national: '+ 7–10 days transit',
};

// Each row of the by-product table comes from the same data as the map, so they never disagree.
const SHIP_ROWS = SHIP_CATEGORIES.map((c) => [
  `!${c.name}`,
  c.ship ?? '—',
  DELIVERY_CELL[c.mode],
  doorRange(c),
]);

export const metadata: Metadata = {
  title: 'Shipping, Delivery & Pickup',
  description:
    'How each thing you buy gets to you, what it costs and how long it takes, from our Bristol factory. Free shipping over $2,500; free pickup on any order.',
};

export default async function ShippingPolicy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const bristol = getShowroom('bristol');
  const outlet = bristol?.outlet;

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
        image={{
          src: '/images/pages/shipping/pallet-off-truck.jpg',
          alt: 'A pallet of wrapped cabinets coming off a truck in a driveway',
        }}
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
      <HomeSection compact>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-contrast-100 bg-[#f9fafd] px-6 py-5">
          <p className="text-sm @xl:text-base">
            <strong className="font-semibold">Free shipping on all orders over $2,500.</strong>{' '}
            <span className="text-contrast-500">Conditions apply; the details are below.</span>
          </p>
          <ButtonLink href="#cost" shape="pill" size="small" variant="secondary">
            See what qualifies
          </ButtonLink>
        </div>
      </HomeSection>
      <DeliveryLadder
        columns={['Category', 'Make & ship', 'Delivery', 'Total to your door']}
        description="The total to your door is the make-and-ship lead time plus 7–10 days of transit, depending on your distance from Connecticut. If something is out of stock we tell you before you pay, and you choose whether to ship the rest now, wait for everything together, or swap. Installation is not included on anything."
        footnote={
          <>
            Lead times are per line from the product data; transit bands are estimates to be
            confirmed. Installation is not included on anything:{' '}
            <Link className="underline underline-offset-4" href="/find-a-pro">
              find an installer
            </Link>
            .
          </>
        }
        rows={SHIP_ROWS}
        tint
        title="How you get each thing"
      />
      <ShippingMap
        description="Transit is about 7 days near our Connecticut hub and up to 10 at the far edge; the lead time for what you're buying is added on top."
        title="Pick what you're buying. The map shows the total to your door."
      />
      <div className="scroll-mt-24" id="cost" />
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
      <div className="scroll-mt-24" id="delivery-day" />
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
      <HomeSection
        kicker="Before you throw anything away"
        tint
        title="Three things worth knowing on the day"
      >
        <div className="grid gap-5 @3xl:grid-cols-3">
          <div className="rounded-3xl border border-contrast-100 bg-white p-6">
            <h3 className="font-heading text-lg font-semibold">
              Things people mistake for packaging
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-contrast-500">
              <li>Finished end panels packed flat under cardboard at the bottom of the pallet.</li>
              <li>Trim, fillers and toe kick arriving as a separate loose carton.</li>
              <li>Hinges and glides in a small box inside a base cabinet.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-contrast-100 bg-white p-6">
            <h3 className="font-heading text-lg font-semibold">Please don&apos;t</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-contrast-500">
              <li>
                Refuse a damaged delivery. The truck doesn&apos;t go back to the factory, so accept
                it, note the damage and call us.
              </li>
              <li>Book your installer before the cabinets have arrived and been checked.</li>
              <li>
                Sign clean if you couldn&apos;t check a box. Write “unable to inspect” instead.
              </li>
            </ul>
          </div>
          <div className="flex flex-col rounded-3xl border border-contrast-100 bg-white p-6">
            <h3 className="font-heading text-lg font-semibold">Damage or shortage</h3>
            <p className="mt-3 text-sm leading-relaxed text-contrast-500">
              Every delivery carries free damage protection. For visible damage, note it on the
              paperwork and call within 48 hours. For concealed damage you have{' '}
              <strong className="font-semibold text-foreground">30 days</strong> to open every box
              and report it. Replacement parts ship first, and if three replacements fail to fix it,
              we refund the cabinet.
            </p>
            <div className="mt-4">
              <ButtonLink href="/support" shape="pill" size="small" variant="primary">
                Report damage
              </ButtonLink>
            </div>
          </div>
        </div>
      </HomeSection>
      <HomeSection
        description="Any cabinet order can be collected free from the factory outlet, and windows and appliances can only be collected. We text you when it's ready; bring the order number, ID and a vehicle that fits it. Assembled cabinets need a van or a trailer, while a 10×10 RTA kitchen fits in a pickup truck. Our staff load; you strap it down."
        kicker="Pickup"
        title="Picking up from Bristol"
      >
        <div className="grid gap-8 @3xl:grid-cols-[1.2fr_1fr] @3xl:items-start">
          <div className="grid gap-4 @xl:grid-cols-2">
            <div className="rounded-3xl border border-contrast-100 bg-white p-6 text-sm">
              <h3 className="font-heading text-lg font-semibold">
                {outlet?.name ?? 'Express Kitchens factory outlet'}
              </h3>
              <p className="mt-2 text-contrast-500">
                {bristol?.address ?? '[Address], Bristol, CT 06010'}
              </p>
              <ul className="mt-2 space-y-0.5 text-contrast-500">
                {(outlet?.hours ?? []).map((h) => (
                  <li key={h.days}>
                    {h.days}: {h.time}
                  </li>
                ))}
              </ul>
              {Boolean(bristol) && (
                <Link
                  className="mt-3 inline-block font-semibold underline underline-offset-4"
                  href={directionsHref(bristol?.address ?? '')}
                  rel="noopener"
                  target="_blank"
                >
                  Directions ↗
                </Link>
              )}
            </div>
            <div className="rounded-3xl border border-contrast-100 bg-white p-6 text-sm">
              <h3 className="font-heading text-lg font-semibold">Pickup timing</h3>
              <p className="mt-2 leading-relaxed text-contrast-500">
                Online orders are ready for pickup in two days, whether that&apos;s windows,
                appliances, hardware or cabinets. Want it today? Buy in person at the factory outlet
                and take it with you.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100">
            <Image
              alt="A pickup truck being loaded with boxed cabinets at the loading dock"
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 40rem, 100vw"
              src="/images/pages/shipping/loading-dock-pickup.jpg"
            />
          </div>
        </div>
      </HomeSection>
      <CabinetFaq
        data={{
          headline: 'Questions about delivery',
          items: [
            {
              q: 'Do you deliver outside Connecticut?',
              a: 'Yes. Cabinets, closets and hardware ship to the 48 contiguous states; orders over $2,500 ship free (conditions apply) and the rest are quoted at checkout. Countertops are Connecticut only, and windows and appliances are pickup only.',
            },
            {
              q: 'Can I get it faster?',
              a: 'Hardware and accessories ship the next business day, and some collections are marked “Ships next day” on their page. For cabinets, pickup from Bristol is usually the fastest route.',
            },
            {
              q: 'Can I change the delivery date?',
              a: 'Yes. Reply to the booking call or text at least two business days ahead. A missed delivery means a second trip and a $[X] redelivery fee.',
            },
            {
              q: 'Do you carry it inside?',
              a: 'No. Delivery is to the curb or driveway with a lift-gate; inside delivery is not available, so have a helper ready.',
            },
            {
              q: 'What if part of my order is out of stock?',
              a: 'We tell you before you pay, and you choose: ship the in-stock items now and the rest later (additional shipping may apply), wait and ship everything together, or swap for an in-stock alternative.',
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
