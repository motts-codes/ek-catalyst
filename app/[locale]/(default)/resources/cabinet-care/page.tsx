import { Droplets, Flame, Sun } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { CheckTable, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';

export const metadata: Metadata = {
  title: 'Cabinet Care & Maintenance',
  description:
    'How to clean painted, stained and slab doors, adjust hinges and drawers, touch up a chip, what never to use, and what the warranty covers.',
};

const CONTACT_HREF = '/contact';
const WARRANTY_HREF = '/warranty';

// Arun's brief of 27 Oct 2026. EK has confirmed there is no free touch-up kit and no care PDF;
// stained doors are birch veneer; the warranty is 1 year and excludes water damage, misuse and
// improper installation. To confirm with EK: whether they sell touch-up markers by finish.
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
          { label: 'What never to use', href: '#avoid', primary: true },
          { label: 'Adjusting doors and drawers', href: '#adjusting', style: 'outline' },
        ]}
        description="A kitchen that's used every day needs a wipe, the odd hinge adjustment and a touch-up now and then. Here's how to do each one, by finish, plus the short list of things never to use."
        image={{
          src: '/images/pages/cabinet-care/hero-wiping-cabinet.jpg',
          alt: 'A smiling woman kneeling to wipe a light oak base cabinet with a microfiber cloth, spray bottle beside her',
        }}
        imageStyle="plain"
        kicker="Cabinet care"
        title="Keep your kitchen looking new"
      />
      <CategoryPoints
        points={[
          { icon: 'stock', label: 'Cleaning, by finish' },
          { icon: 'tag', label: 'What never to use' },
          { icon: 'returns', label: 'Adjusting hinges and drawers' },
          { icon: 'clock', label: 'Humidity, light and heat' },
        ]}
      />
      <HomeSection
        description="A few minutes at the start saves most problems later."
        kicker="New cabinets? Start here"
        tint
        title="The first two weeks"
      >
        <div className="grid gap-8 @xl:grid-cols-2 @xl:gap-12">
          <CheckTable
            items={[
              {
                text: "Don't take out your old kitchen until the new cabinets have arrived and you've checked them.",
                no: true,
              },
              'Unbox with two people and check every piece against your packing list. If anything was damaged in transit, file a claim with the carrier, then call us at 860-247-1000.',
              'Store cabinets somewhere dry, ideally at 40–50% humidity. Very dry or very damp rooms cause problems.',
              'Let the cabinets sit in the room for a day or two before they go on the wall.',
            ]}
            title="Before installation"
          />
          <CheckTable
            items={[
              'Wipe the construction dust off inside and out with a damp microfiber cloth, one area at a time, drying as you go.',
              'Expect doors and drawers to need a small adjustment as they settle.',
              'Adjust everything before you fit knobs and pulls.',
              "Keep the packaging until you're sure everything is right. Unopened items can be returned within 30 days.",
            ]}
            title="After installation"
          />
        </div>
      </HomeSection>
      <CardsRow
        cards={[
          {
            title: 'Painted doors',
            description:
              'Mild dish soap in warm water, on a microfiber cloth. Wipe, then dry with a second cloth. Nothing abrasive: paint scratches more easily than stain.',
            image: {
              src: '/images/pages/cabinet-care/painted-white-door.jpg',
              alt: 'A painted white cabinet door being wiped',
            },
          },
          {
            title: 'Stained wood',
            description:
              'A mild wood cleaner in warm water. Wipe with the grain and dry right away. Once or twice a year, give it a thorough clean, one small area at a time.',
            image: {
              src: '/images/pages/cabinet-care/stained-birch-door-2.jpg',
              alt: 'Stained birch shaker doors and a drawer on a kitchen island',
            },
          },
          {
            title: 'Slab and textured doors',
            description:
              'Warm water and a drop of dish soap, dried straight away. Water left standing at the edges can lift the finish.',
            image: {
              src: '/images/pages/cabinet-care/walnut-slab-door.jpg',
              alt: 'Walnut slab doors and drawers with slim black pulls under a white countertop',
            },
          },
        ]}
        description="Painted and stained doors need different care."
        imageStyle="plain"
        kicker="Cleaning"
        title="By finish"
      />
      <div id="avoid" />
      <HomeSection kicker="What not to use" tint title="The short list">
        <div className="grid gap-8 @xl:grid-cols-2 @xl:gap-12">
          <CheckTable
            items={[
              { text: 'Abrasive cleaners, scouring pads or powders', no: true },
              { text: 'Bleach, ammonia, solvents, or anything labeled "degreaser"', no: true },
              { text: 'Wax or silicone polishes. They build up and turn yellow.', no: true },
              { text: "Magic-eraser sponges on painted doors. They're a fine abrasive.", no: true },
              { text: 'Steam cleaners, or any cleaner left to sit', no: true },
            ]}
            title="Never on a cabinet"
          />
          <div className="relative min-h-[220px] overflow-hidden rounded-3xl bg-contrast-100">
            <Image
              alt="Bleach, spray cleaner, scouring powder, aerosol polish, a scouring sponge, a magic eraser and steel wool beside a white cabinet door: the things to keep off a cabinet"
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 40rem, 100vw"
              src="/images/pages/cabinet-care/never-on-a-cabinet.jpg"
            />
          </div>
        </div>
      </HomeSection>
      <HomeSection kicker="Routine care" title="Every day, and once or twice a year">
        <div className="grid gap-8 @xl:grid-cols-2 @xl:gap-12">
          <CheckTable
            items={[
              'Wipe up spills, drips and grease as they happen. Food and water left standing can stain the finish.',
              'Dust with a dry microfiber cloth.',
              {
                text: "Never hang a wet dish towel over a door. It's the most common cause of finish damage under the sink.",
                no: true,
              },
              {
                text: "Don't clean cabinets with your dishcloth. It carries detergent and grease.",
                no: true,
              },
            ]}
            title="Every day"
          />
          <CheckTable
            items={[
              'Give every cabinet front a thorough clean, one small area at a time, with a damp cloth, drying as you go.',
              'Tighten hinge screws and realign doors.',
              'Check that drawers run smoothly and sit level.',
              'Clean inside the sink base and under the range hood, where grease collects.',
            ]}
            title="Once or twice a year"
          />
        </div>
      </HomeSection>
      <Prose
        actions={[
          { label: 'Watch: adjusting a soft-close hinge', href: '/resources/how-to-videos' },
        ]}
        body={[
          'Wood moves with the seasons, and hardware settles after installation. Each hinge has three screws: one moves the door side to side, one up and down, and one in and out. Drawer glides can be leveled with a screwdriver. Make your adjustments after installation and before you fit knobs and pulls.',
        ]}
        id="adjusting"
        image={{
          src: '/images/pages/cabinet-care/hinge-adjustment-screws.jpg',
          alt: 'A soft-close hinge on a white cabinet with its three adjustment screws labeled in and out, side to side, and up and down',
        }}
        imagePosition="left"
        kicker="Adjusting"
        tint
        title="Doors and drawers are meant to be adjusted"
      />
      <Prose
        actions={[{ label: 'Send us a photo', href: CONTACT_HREF }]}
        body={[
          'For small chips and scratches, a fill stick and a touch-up marker in a matching color, from most hardware stores, will hide most marks. Soften the stick in your hand, fill with a back-and-forth motion, then blend with the marker. Practice on the inside of a door first. Paint is harder to blend than stain, so if the damage is bigger than a coin, send us a photo before you start.',
        ]}
        image={{
          src: '/images/pages/cabinet-care/touch-up-chip.jpg',
          alt: 'A hand holding a fill stick and touch-up marker beside a small chip on the edge of a white cabinet door',
        }}
        kicker="Touch-ups"
        title="Chips and scratches"
      />
      <CardsRow
        cards={[
          {
            icon: Droplets,
            title: 'Humidity',
            description:
              'Keep the kitchen ventilated and the cabinets dry all year, including in vacation homes. Damp, closed-up rooms are hard on any finish.',
          },
          {
            icon: Sun,
            title: 'Sunlight',
            description:
              'Strong direct sun can lighten or darken the doors it reaches over time. Blinds help.',
          },
          {
            icon: Flame,
            title: 'Heat',
            description:
              'Self-cleaning ovens, kettles and toasters under a wall cabinet give off heat and steam. Pull small appliances forward when you use them.',
          },
        ]}
        hideImages
        kicker="The room"
        tint
        title="Humidity, sunlight and heat"
      />
      <Prose
        actions={[{ label: 'Read the full warranty', href: WARRANTY_HREF, style: 'outline' }]}
        body={[
          "Every cabinet is covered for 1 year from purchase against defects in materials and workmanship. The warranty doesn't cover normal wear, accidents, misuse, dirt, water damage or improper installation, which is why the care above matters.",
        ]}
        kicker="Warranty"
        title="Covered for a year"
      />
      <ClosingBand
        description="Send us a photo, and we'll tell you how to fix it or whether it's covered. Call or text 860-247-1000, any time."
        primary={{ label: 'Send us a message', href: CONTACT_HREF }}
        secondary={{ label: 'Read the warranty', href: WARRANTY_HREF }}
        tint
        title="Something not right?"
      />
    </>
  );
}
