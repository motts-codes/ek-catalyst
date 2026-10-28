import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import {
  Actions,
  FinePrint,
  PageBreadcrumbs,
  PageHero,
  RedBox,
} from '@/vibes/soul/sections/page-kit';
import { ShippingMap } from '@/vibes/soul/sections/shipping-map';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { SHIP_CATEGORIES, shipsIn } from '~/lib/pages/shipping';
import { directionsHref, getShowroom } from '~/lib/pages/showrooms';

const PHONE = { label: 'Call or text 860-247-1000', href: 'tel:+18602471000' };

const DELIVERY_CELL = {
  pickup: 'Pickup at our Bristol Factory Outlet',
  national: '+ 7–10 days transit',
};

// Each row of the by-product table comes from the same data as the map, so they never disagree.
const SHIP_ROWS = SHIP_CATEGORIES.map((c) => [`!${c.name}`, shipsIn(c), DELIVERY_CELL[c.mode]]);

// Built on EK's shipping policy and its answers of 27 Oct 2026: ground-floor delivery to the 48
// contiguous states (closets nationwide; windows and appliances pickup only, Connecticut), the
// carrier responsible once an order leaves EK, transit damage claimed with the carrier. Nothing
// EK hasn't said: no booking call, delivery-window text, truck size, access or redelivery fees,
// damage windows, replacement promise, or rush shipping. Installation isn't mentioned, except in
// the fine print, which is EK's own policy wording. Free-shipping conditions still to confirm.
export const metadata: Metadata = {
  title: 'Shipping, Delivery & Pickup',
  description:
    'How cabinets, closets, windows and appliances get to you: ship times, ground-floor delivery to the 48 contiguous states, pickup in Bristol, and what to check on delivery day.',
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
          { label: 'Delivery day, step by step', href: '#delivery-day', style: 'outline' },
        ]}
        description="Cabinets ship by freight to the 48 contiguous states, or you can pick them up in Bristol. Closets ship nationwide. Windows and appliances are pickup only, for Connecticut customers. Here's how long each takes, where it's delivered and what to check on delivery day."
        image={{
          src: '/images/pages/shipping/ek-truck-unloading.jpg',
          alt: 'A driver unloading a shrink-wrapped pallet of cabinets from the liftgate of an Express Kitchens truck',
        }}
        imageStyle="plain"
        kicker="Shipping, delivery & pickup"
        title="How your order gets to you"
      />
      <CategoryPoints
        points={[
          { icon: 'truck', label: 'Free shipping on orders over $2,500' },
          { icon: 'pickup', label: 'Pickup from Bristol' },
          { icon: 'stock', label: 'Delivered to the ground floor' },
          { icon: 'tag', label: 'Ships to the 48 contiguous states' },
        ]}
      />
      <DeliveryLadder
        className="bg-[#fdf3f5]"
        columns={['Category', 'Ships in', 'Delivery']}
        compact
        description="Each product ships in the time shown, then spends 7–10 days in transit, depending on how far you are from Connecticut. If something is out of stock, we'll tell you, and you choose whether to ship the rest now, wait for everything together, or swap."
        footnote="Ship times are per collection. Transit times are estimates."
        highlight="white"
        inline
        look="minimal"
        narrow
        rows={SHIP_ROWS}
        title="How you get each thing"
      />
      <HomeSection compact>
        <RedBox
          kicker="Free shipping"
          media={{
            image: {
              src: '/images/pages/shipping/free-shipping-truck-wide.jpg',
              alt: 'An Express Kitchens tractor-trailer pulling out from the showroom at dusk',
            },
            split: '50/50',
          }}
          title="Free shipping on all orders over $2,500"
        >
          <p className="max-w-xl text-sm leading-relaxed text-white/85 @xl:text-base">
            Conditions apply; the details are below.
          </p>
          <Actions
            actions={[{ label: 'See what qualifies', href: '#cost', primary: true }]}
            className="mt-6"
            onRed
          />
        </RedBox>
      </HomeSection>
      <ShippingMap
        description="Transit takes about 7 days near Connecticut, and up to 10 farther away, after your order ships."
        title="Pick what you're buying to see when it could arrive"
      />
      <div className="scroll-mt-24" id="cost" />
      <DeliveryLadder
        columns={['Order total', 'Shipping']}
        description="Free shipping applies to orders of $2,500 or more after discounts, delivered curbside by freight to a standard-access address in the contiguous 48 states."
        inline
        look="minimal"
        narrow
        rows={[
          ['!Under $2,500', 'Calculated at checkout'],
          ['!$2,500 and over', 'Free'],
          ['!Pickup from Bristol, any total', 'Free'],
        ]}
        title="What shipping costs"
      />
      <div className="scroll-mt-24" id="delivery-day" />
      <CardsRow
        cards={[
          {
            title: 'Be there to sign',
            description:
              'Someone 18 or over needs to be home to accept the delivery. Tell us before you order if your street is hard for a large truck to reach.',
          },
          {
            title: 'Delivery is to the ground floor',
            description:
              "The driver brings the pallet to your curb or driveway. Moving it inside or upstairs is up to you, so have a helper ready, since cabinets can weigh over 100 lb. Delivery inside your home and assembly aren't included unless you add them to your order.",
          },
          {
            title: 'Check before the driver leaves',
            description:
              'Count the pieces and look for damage. Write any damage on the delivery receipt (the Bill of Lading), have the driver sign it, and keep your copy.',
          },
        ]}
        columns={3}
        hideImages
        kicker="Delivery day"
        numbered
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
                Refuse a damaged delivery. Accept it, note the damage on the receipt, and file a
                claim with the carrier.
              </li>
              <li>
                Take out your old kitchen before the new cabinets have arrived and been checked.
              </li>
              <li>
                Sign clean if you couldn&apos;t check a box. Write “unable to inspect” instead.
              </li>
            </ul>
          </div>
          <div className="flex flex-col rounded-3xl border border-contrast-100 bg-white p-6">
            <h3 className="font-heading text-lg font-semibold">Damage or shortage</h3>
            <p className="mt-3 text-sm leading-relaxed text-contrast-500">
              Once your order is with the carrier, the carrier is responsible for loss or damage in
              transit. Note any damage on the delivery receipt, then file a claim with the carrier
              that delivered your order. After that, call us at 860-247-1000 and we&apos;ll help
              with the rest. Open and check every box as soon as you can. There&apos;s no restocking
              fee on items damaged in transit.
            </p>
            <div className="mt-4">
              <ButtonLink href={PHONE.href} shape="pill" size="small" variant="primary">
                Call 860-247-1000
              </ButtonLink>
            </div>
          </div>
        </div>
      </HomeSection>
      <HomeSection
        description="You can pick up any cabinet order from our Bristol Factory Outlet instead of having it shipped. We'll let you know when it's ready. Bring your order number, ID and a vehicle big enough for it: assembled cabinets usually need a van or a trailer."
        kicker="Pickup"
        title="Picking up from Bristol"
      >
        <div className="grid gap-8 @3xl:grid-cols-[1.2fr_1fr] @3xl:items-start">
          <div className="grid gap-4 @xl:grid-cols-2">
            {/* The EK red box: white text is 6.9:1 on #9F3632. */}
            <div className="rounded-3xl bg-[#9f3632] p-6 text-sm text-white">
              <h3 className="font-heading text-lg font-semibold">
                {outlet?.name ?? 'Express Kitchens factory outlet'}
              </h3>
              <p className="mt-2 text-white/85">
                {bristol?.address ?? '[Address], Bristol, CT 06010'}
              </p>
              <ul className="mt-2 space-y-0.5 text-white/85">
                {(outlet?.hours ?? []).map((h) => (
                  <li key={h.days}>
                    {h.days}: {h.time}
                  </li>
                ))}
              </ul>
              {Boolean(bristol) && (
                <Link
                  className="mt-3 inline-block font-semibold text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#9f3632]"
                  href={directionsHref(bristol?.address ?? '')}
                  rel="noopener"
                  target="_blank"
                >
                  Directions ↗
                </Link>
              )}
            </div>
            <div className="rounded-3xl bg-[#fdf3f5] p-6 text-sm">
              <h3 className="font-heading text-lg font-semibold">Pickup timing</h3>
              <p className="mt-2 leading-relaxed text-contrast-500">
                Windows and appliances are usually ready in 2 days. Cabinets are ready when they
                would otherwise ship (see the ship times above). Quick-ship cabinets (Eden, Madison,
                Avon and Derry) are also sold at the Factory Outlet.
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
              a: 'Yes. Cabinets ship to the 48 contiguous states, but not to Alaska or Hawaii. Closets ship nationwide. Orders over $2,500 ship free (conditions apply). Windows and appliances are pickup only, for Connecticut customers.',
            },
            {
              q: 'Do you carry it inside?',
              a: "Delivery is to the ground floor: your curb or driveway. Delivery inside your home isn't included unless you add it to your order, so have a helper ready.",
            },
            {
              q: 'What if part of my order is out of stock?',
              a: 'We tell you before you pay, and you choose: ship the in-stock items now and the rest later (additional shipping may apply), wait and ship everything together, or swap for an in-stock alternative.',
            },
            {
              q: 'What if it arrives damaged?',
              a: "Don't refuse it. Note the damage on the delivery receipt, have the driver sign it and keep your copy. Then file a claim with the carrier, and call us at 860-247-1000 so we can help.",
            },
            {
              q: "Who's responsible for my order in transit?",
              a: "Once your order leaves us with the carrier, the carrier is responsible for loss, breakage or theft in transit. That's why checking every box at delivery matters.",
            },
          ],
        }}
      />
      <FinePrint variant="plain">
        Express Kitchens isn&apos;t responsible for items lost, broken or stolen after they&apos;ve
        been released to the shipping carrier. All items are delivered to the ground floor. In-home
        delivery, assembly and installation are excluded unless purchased.
      </FinePrint>
      <ClosingBand
        description="Ordered, or about to? Ask us anything about ship times, delivery or pickup and we'll sort it out."
        phone={null}
        primary={PHONE}
        secondary={{ label: 'Send us a message', href: '/contact' }}
        tint
        title="Questions about your delivery?"
      />
    </>
  );
}
