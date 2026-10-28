import { Clock, PackageSearch, Palette, Wrench } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import {
  Actions,
  CheckTable,
  LegalText,
  PageBreadcrumbs,
  PageHero,
  Prose,
  StepsRow,
} from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Warranty',
  description:
    "Every cabinet is covered for 1 year from the date of purchase against defects in materials and workmanship. What's covered, what isn't, and how to make a claim.",
};

const CLAIM_HREF = '/contact';
const PHONE = { label: 'Call or text 860-247-1000', href: 'tel:+18602471000' };

// Arun's brief of 28 Oct 2026, built only on EK's warranty terms: the policy page (Oct 2026, the
// source of truth) and the live site. The two differ in one place: the live site covers "all
// products", the policy page "all cabinets… cabinets only". This page follows the policy page;
// confirm with EK. No figures EK hasn't given (no tolerances, no hardware term, no review
// times, no refunds). To fix with EK: the policy's "may offer from those originally supplied"
// should read "may differ".
const TERMS = [
  'Express Kitchens Inc. (warrantor) warrants to the original consumer purchaser only, that all cabinets manufactured or supplied by warrantor will be free from defects in material and workmanship under normal use and service for one year from the date of purchase (proof of purchase required). This warranty applies to cabinets only and does not cover any other products.',
  'This warranty does not cover damage resulting from normal wear, accident, misuse, dirt, water, tampering, unreasonable use, improper installation, servicing performed or attempted by unauthorized service agencies or units that have been modified or used for commercial purposes.',
  'If the product exhibits such a defect, please write with a description of the defect. Express Kitchens will, at their option provide repair or replacement parts or replace with a functionally equivalent product. Express Kitchens periodically make changes to its product line and specifications. If a warranty claim is filed for a discontinued or unavailable item, Express Kitchens will replace the part(s) under warranty with a new part of the same style or with a similar style currently offered. Some replacement parts are subject to availability and may differ from those originally supplied.',
  "Express Kitchens cannot be held responsible for replacement product that may not exactly match installed product. Such repair or replacement parts or products shall be at warrantor's expense, but consumer shall bear all other expenses, including but not limited to, cost of removal, transportation, re-installation, communication and any special service requested such as overtime labor, etc. Repaired or replaced items carry only the unexpired portion of the original warranty.",
  'Except to the extent provided by applicable law, all implied warranties, including warranties of merchantability and fitness for a particular purpose, are limited in duration to the shorter of the period provided by law or the period of this warranty, and under no circumstances shall Express Kitchens be liable for incidental damages sustained in connection with the product. The warranty above constitutes the entire warranty and is in lieu of all others expressed or implied.',
  'Some states do not allow the exclusion or limitation of incidental or consequential damages, or limitation on how long an implied warranty lasts, so the above limitations or exclusions may not apply to you. This warranty gives you specific legal rights, and you may also have other legal rights which vary from state to state.',
];

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
          { label: 'Make a claim', href: CLAIM_HREF, primary: true },
          { label: 'Read the full terms', href: '#terms', style: 'outline' },
        ]}
        description="Every cabinet we make or supply is covered for 1 year from the date of purchase against defects in materials and workmanship. If something's wrong, tell us and we'll repair it, send a replacement part, or replace the cabinet."
        image={{
          src: '/images/pages/warranty/one-year-walnut.jpg',
          alt: 'A smiling Express Kitchens designer beside a walnut base cabinet, with a 1-year warranty badge',
        }}
        imageStyle="plain"
        kicker="Warranty"
        title="A 1-year warranty on every cabinet"
      />
      <CategoryPoints
        points={[
          { icon: 'clock', label: '1 year from the date of purchase' },
          { icon: 'stock', label: 'Cabinets only' },
          { icon: 'tag', label: 'For the original buyer, with proof of purchase' },
          { icon: 'returns', label: 'Repair, replacement parts or a replacement cabinet' },
        ]}
      />
      <HomeSection kicker="Coverage" title="What's covered, and what isn't">
        <div className="grid gap-8 @xl:grid-cols-2 @xl:gap-12">
          <CheckTable
            items={[
              'Defects in materials and workmanship, under normal use',
              'Every cabinet we make or supply, in every line: Star, Prism, Euro Max and Euro Value',
            ]}
            title="Covered"
          />
          <CheckTable
            items={[
              { text: 'Normal wear and tear', no: true },
              { text: 'Accidents, misuse or unreasonable use', no: true },
              { text: 'Dirt and water damage', no: true },
              { text: 'Improper installation', no: true },
              { text: "Repairs by anyone we haven't authorized, or tampering", no: true },
              { text: 'Cabinets that have been modified, or used commercially', no: true },
              { text: 'Products other than cabinets', no: true },
            ]}
            title="Not covered"
          />
        </div>
        <Actions
          actions={[
            {
              label: 'How to care for your cabinets',
              href: '/resources/cabinet-care',
              style: 'outline',
            },
          ]}
          className="mt-8"
        />
      </HomeSection>
      <StepsRow
        actions={[{ label: 'Start a claim', href: CLAIM_HREF, primary: true }]}
        kicker="Claims"
        look="red-box"
        note="Prefer to talk? Call or text 860-247-1000, any time."
        steps={[
          {
            title: "Tell us what's wrong",
            description:
              'Write to us with a description of the defect, your order number and photos if you can.',
          },
          {
            title: 'We look at it',
            description: "We'll check the details against your order and proof of purchase.",
          },
          {
            title: 'We put it right',
            description:
              "We'll repair it, send replacement parts, or replace the cabinet with an equivalent one. That's our choice, based on what's wrong.",
          },
        ]}
        title="How to make a claim"
      />
      <CardsRow
        cards={[
          {
            icon: Wrench,
            title: 'We cover the parts, not the labor',
            description:
              'Repair and replacement parts are on us. Removal, transport, reinstallation and any special service (such as overtime labor) are on you.',
          },
          {
            icon: Palette,
            title: 'Finishes can differ slightly',
            description:
              'A replacement door or panel may not exactly match cabinets that have aged in your kitchen.',
          },
          {
            icon: PackageSearch,
            title: 'Discontinued styles',
            description:
              "If your style is no longer made, we'll replace the part with the same style or the closest one we currently offer, subject to availability.",
          },
          {
            icon: Clock,
            title: "Replacements don't restart the clock",
            description:
              'A repaired or replaced cabinet keeps the time left on your original warranty.',
          },
        ]}
        columns={4}
        hideImages
        kicker="Good to know"
        title="The small print, in plain English"
      />
      <CardsRow
        cards={[
          {
            title: 'A door looks out of line',
            image: {
              src: '/images/pages/warranty/hinge-screwdriver.jpg',
              alt: 'A screwdriver turning the adjustment screw on a soft-close cabinet hinge',
            },
            description:
              'Each hinge has three adjustment screws. Two minutes with a screwdriver fixes most doors that look warped.',
          },
          {
            title: 'A drawer sticks or sits crooked',
            image: {
              src: '/images/pages/warranty/drawer-glide-screwdriver.jpg',
              alt: 'A hand with a red screwdriver adjusting the glide on an open white drawer',
            },
            description: 'Drawer glides can be leveled with a screwdriver.',
          },
          {
            title: 'Doors move with the seasons',
            image: {
              src: '/images/pages/warranty/kitchen-window-open.jpg',
              alt: 'A bright white kitchen with the window over the sink open to the garden',
            },
            description:
              'Very dry or very damp air moves wood. Keep the kitchen ventilated, and most doors settle on their own.',
          },
        ]}
        className="bg-[#fdf3f5] [&>div]:pb-2"
        imageStyle="plain"
        kicker="Before you claim: is it just an adjustment?"
        title="Most door and drawer problems are a quick fix"
      />
      <Prose
        actions={[{ label: 'Send us a photo', href: CLAIM_HREF, style: 'outline' }]}
        body={["Still not right? Send us a photo and we'll tell you whether it's covered."]}
        className="bg-[#fdf3f5]"
        tightTop
      />
      <CabinetFaq
        data={{
          headline: 'Questions about the warranty',
          items: [
            {
              q: 'When does the warranty start?',
              a: 'On the date of purchase, not the date of delivery or installation.',
            },
            {
              q: 'Does installation affect the warranty?',
              a: "The warranty covers the cabinet, not the installation. Damage caused by improper installation isn't covered.",
            },
            {
              q: 'Is the warranty transferable?',
              a: 'No. It covers the original buyer only, with proof of purchase.',
            },
            {
              q: 'Does it cover my countertops, windows or appliances?',
              a: 'No. This warranty covers cabinets only.',
            },
            {
              q: 'Is a scratch or chip covered?',
              a: "Not if it comes from normal use or an accident. If a cabinet arrived damaged, that's a shipping claim, not a warranty claim. [See damaged deliveries](/faq#damage-and-claims)",
            },
          ],
        }}
      />
      <LegalText id="terms" paragraphs={TERMS} title="Full warranty terms" />
      <ClosingBand
        description="Send us a description and a photo, and we'll take it from there."
        phone={PHONE}
        primary={{ label: 'Make a claim', href: CLAIM_HREF }}
        tint
        title="Something not right with your cabinets?"
      />
    </>
  );
}
