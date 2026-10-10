import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Cabinet Care & Maintenance',
  description:
    'How to clean painted, stained and laminate doors, adjust hinges and drawers, touch up a chip, and what never to use.',
};

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-contrast-100 bg-white p-6">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-contrast-500">
        {items.map((item) => (
          <li key={item.slice(0, 30)}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function CabinetCare({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'Cabinet care', href: '/resources/cabinet-care' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Download the care guide (PDF)', href: '#', primary: true },
          { label: 'What not to use', href: '#avoid' },
        ]}
        description="We build cabinets to last and check every one before it leaves Bristol, but a kitchen that gets used every day will still want the odd wipe, a hinge adjustment now and then, and the occasional touch-up. Here's how to do each one, by finish, and the short list of things never to use on them."
        imageLabel="A hand wiping a painted shaker door with a microfiber cloth"
        kicker="Cabinet care & maintenance"
        title="Keep your kitchen looking new"
      />
      <CategoryPoints
        points={[
          { icon: 'stock', label: 'Cleaning, by finish' },
          { icon: 'returns', label: 'Adjusting hinges and drawers' },
          { icon: 'tag', label: 'Touch-ups and kits' },
          { icon: 'clock', label: 'Humidity, light and heat' },
        ]}
      />
      <CardsRow
        cards={[
          {
            title: 'Painted doors',
            description:
              'Mild dish soap diluted in warm water, on a microfiber cloth. Wipe, then dry with a second cloth. Nothing abrasive: paint scratches before stain does.',
            imageLabel: 'A painted white door being wiped',
          },
          {
            title: 'Stained and natural wood',
            description:
              'A mild wood cleaner diluted in warm water. Wipe with the grain and dry immediately. Once or twice a year, a thorough clean one small area at a time.',
            imageLabel: 'A stained oak door',
          },
          {
            title: 'Laminate and textured',
            description:
              'Warm water and a drop of dish soap, dried at once. Standing water at the edges is what lifts laminate.',
            imageLabel: 'A laminate slab door',
          },
        ]}
        description="Painted and stained doors want different things."
        kicker="Cleaning"
        tint
        title="By finish"
      />
      <HomeSection compact>
        <div className="grid gap-5 @xl:grid-cols-2">
          <Checklist
            items={[
              'Wipe spills, drips and grease as they happen; food and water left standing discolour the finish.',
              'Dust with a dry microfiber cloth.',
              'Never hang a wet dish towel over a door. It is the most common cause of finish damage under the sink.',
              "Don't clean cabinets with the dishcloth; it carries detergent and grease.",
            ]}
            title="Every day"
          />
          <Checklist
            items={[
              'A thorough clean of every exterior, one small area at a time, with a damp cloth dried immediately.',
              'Tighten hinge screws and re-align doors.',
              'Check that drawer glides run full and level.',
              'Clean inside the sink base and under the range hood, where grease collects.',
            ]}
            title="Once or twice a year"
          />
        </div>
      </HomeSection>
      <Prose
        actions={[
          { label: 'Watch: adjusting a soft-close hinge', href: '/resources/how-to-videos#care' },
        ]}
        body={[
          'Hinges and drawers are meant to be adjusted. Wood moves with the seasons and hardware settles after installation. Every hinge has three screws — side-to-side, up-down and in-out — and every drawer glide can be re-levelled with a screwdriver. Do it after installation and before fitting knobs and pulls, and check the glides before a cabinet goes on the wall.',
        ]}
        imageLabel="Diagram — a soft-close hinge with the three adjustment screws labelled"
        imagePosition="left"
        kicker="Adjusting"
        tint
        title="Doors and drawers are meant to move"
      />
      <Prose
        actions={[{ label: 'Send a photo to support', href: '/contact' }]}
        body={[
          'Every collection has a matching touch-up kit: a fill stick and a colour marker, free with every kitchen order (to confirm). Soften the stick in your hand, fill with a back-and-forth motion, then blend the marker with a fingertip. Practise on the inside of a door first. Paint is harder to blend than stain, so if the damage is bigger than a coin, send us a photo before you start.',
        ]}
        imageLabel="A touch-up kit beside a chipped door"
        kicker="Touch-ups"
        title="Chips and scratches: the kit in the drawer"
      />
      <HomeSection
        description="The first two weeks matter most."
        kicker="Before and after installation"
        tint
        title="Give the cabinets a good start"
      >
        <div className="grid gap-5 @xl:grid-cols-2">
          <Checklist
            items={[
              "Don't take the old kitchen out until the new cabinets have arrived and been inspected.",
              'Unbox with two people, check every piece, then keep them boxed until install.',
              'Store dry, at 40–50% relative humidity; below 20% or above 70% causes problems.',
              'Give the cabinets a day or two in the room to acclimatise before they go on the wall.',
            ]}
            title="Before"
          />
          <Checklist
            items={[
              'Wipe construction dust off every interior and exterior with a damp microfiber cloth, one area at a time, dried as you go.',
              'Expect doors and drawers to need a small adjustment as they settle.',
              'Adjust everything before fitting knobs and pulls.',
              'Keep the packaging until you are sure, then recycle the cardboard.',
            ]}
            title="After"
          />
        </div>
      </HomeSection>
      <CardsRow
        cards={[
          {
            title: 'Humidity',
            description:
              'Keep the kitchen ventilated and the cabinets dry all year round, vacation homes included. Poorly ventilated rooms are hard on a finish.',
          },
          {
            title: 'Sunlight',
            description:
              'Every finish has UV inhibitors, but strong direct light will still lighten or darken the doors it reaches. Blinds help; so does rotating a sample door to compare.',
          },
          {
            title: 'Heat',
            description:
              "Self-cleaning ovens, kettles and toasters under a wall cabinet release heat and steam. Pull small appliances forward when they're on.",
          },
        ]}
        hideImages
        kicker="The room"
        title="Wood moves. Here's what to expect."
      />
      <div id="avoid" />
      <HomeSection kicker="What not to use" tint title="The short list">
        <div className="grid gap-5 @xl:grid-cols-2">
          <Checklist
            items={[
              'Abrasive cleaners, scouring pads or powders',
              'Bleach, ammonia, solvents or anything with "degreaser" on the label',
              'Wax or silicone polishes, which build up and yellow',
              'Magic-eraser sponges on painted doors; they are a fine abrasive',
              'Steam cleaners, or any cleaner left to sit',
            ]}
            title="Never on a cabinet"
          />
          <div className="relative min-h-[220px] overflow-hidden rounded-3xl bg-contrast-100">
            <MediaPlaceholder label="The cleaners to avoid, lined up" />
          </div>
        </div>
      </HomeSection>
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
