import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { contactRows } from '~/lib/forms/fields';
import { submitPriceMatchLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Price Match Guarantee',
  description:
    "Bring any competitor cabinet quote of $3,000 or more. We match it after adding free upgrades: all-plywood boxes, soft-close hinges and full-extension glides. If we can't match it, you get $500.",
};

const FIELDS: Array<Field | Field[]> = [
  ...contactRows({ zip: false }),
  { type: 'text', name: 'orderNumber', label: 'Order number, if you have already ordered' },
  {
    type: 'text',
    name: 'competitor',
    label: 'Competitor, and a link to the quote or product',
    required: true,
  },
  {
    type: 'text',
    name: 'total',
    label: 'Their total including shipping (minimum $3,000)',
    required: true,
  },
  {
    type: 'textarea',
    name: 'details',
    label: 'Anything else we should know (the quote itself can be emailed to us after we reply)',
  },
];

export default async function PriceMatch({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Support', href: '/support' },
          { label: 'Price match guarantee', href: '/price-match-guarantee' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Submit a quote', href: '#submit', primary: true },
          { label: 'What qualifies', href: '#qualifies' },
        ]}
        description="If you've been quoted less for a kitchen somewhere else, bring us the quote. For any competitor cabinet quote of $3,000 or more, we match the price, and we do it after adding free upgrades to your order: all-plywood cabinets, soft-close hinges and full-extension glides. If we genuinely can't match it, you get $500. Either way you'll hear from us within one business day."
        imageLabel="A collection card with its price beside an installed kitchen"
        kicker="Price match guarantee"
        title="Bring your quote. We'll beat it, or pay you $500."
      />
      <CategoryPoints
        fine="Competitor cabinet quotes of $3,000+. Terms to be confirmed."
        points={[
          { icon: 'stock', label: 'All-plywood cabinets, free' },
          { icon: 'returns', label: 'Soft-close hinges, free' },
          { icon: 'zap', label: 'Full-extension glides, free' },
          { icon: 'price', label: "Can't match it? You get $500" },
        ]}
      />
      <CardsRow
        cards={[
          {
            title: 'Bring us the quote',
            description:
              "Upload the competitor's itemized cabinet quote ($3,000 or more), or bring it to any showroom. Before you order, or up to 15 days after if you've already ordered with us (window to confirm).",
            imageLabel: 'Step 1',
          },
          {
            title: 'We price the same kitchen',
            description:
              'Same door style, sizes and accessories, from a seller with a phone number and a return policy, total order against total order. Then we add the upgrades: all-plywood box, soft-close hinges, full-extension glides.',
            imageLabel: 'Step 2',
          },
          {
            title: 'We match it, or pay you $500',
            description:
              "Their price, our cabinet with the upgrades included: that's how we beat it. If we can't match, you get $500. One business day either way.",
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How it works"
        tint
        title="Three steps, one business day"
      />
      <div id="qualifies" />
      <CardsRow
        cards={[
          {
            title: 'Recent, and $3,000+',
            description:
              'A competitor cabinet quote of $3,000 or more, dated within the last 30 days and still available.',
          },
          {
            title: 'Like for like',
            description:
              "Same door style, framed or frameless, sizes, finish and accessories, with a comparable lead time and delivery to Connecticut. If theirs is a particle-board box or lacks soft-close, ours still counts: that's the free upgrade.",
          },
          {
            title: 'Written, not verbal',
            description:
              'A screenshot, PDF or link we can verify. "They said" doesn\'t count, for your protection as much as ours.',
          },
          {
            title: 'The whole order',
            description:
              'Total against total, including shipping, tax and assembly. Not one line item.',
          },
        ]}
        columns={4}
        hideImages
        kicker="What qualifies"
        title="Four checks. Not sure it passes? Send it anyway."
      />
      <Prose
        body={[
          'Included: cabinets on every line, RTA and assembled; closets; cabinet hardware, sinks and faucets; matched against any authorized seller with a published price, a phone number and a returns policy.',
          "Not included: clearance, floor models, closeouts and auction or marketplace listings; members-only, coupon-code or bundle pricing; countertops (quoted to your kitchen) and appliances (manufacturer pricing); and sellers with no phone number or who don't reply to inquiries, which is a red flag rather than a price.",
          'Price-matched orders can still use 0% financing, and the $500 is paid as a credit or gift card. (To confirm.)',
        ]}
        kicker="The small print, in plain words"
        tint
        title="What's in and what's out"
      />
      <Prose
        actions={[
          { label: "What's in a 10×10", href: '/resources/ten-by-ten-kitchen' },
          { label: 'Why Express Kitchens', href: '/why-express-kitchens' },
        ]}
        body={[
          "We build Star Cabinetry in our own Bristol factory and sell it in our own showrooms, so there's no distributor and no dealer margin in the price you see. When a cheaper quote turns up, it usually turns out to be a different cabinet — a particle-board box, ¾ overlay instead of full, no soft-close — or a seller with no phone number. Compare the cabinet list, not just the number, and you'll see why this guarantee rarely gets used.",
        ]}
        imageLabel="An Express Kitchens box beside a particle-board box, cut open"
        kicker="Why it rarely comes up"
        title="The price has a reason"
      />
      <LeadFormCard
        action={submitPriceMatchLead}
        description="We reply within one business day with a matched price, or your $500."
        fields={FIELDS}
        id="submit"
        kicker="Submit a quote"
        submitLabel="Submit for price match"
        title="Send us the competitor's quote"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about price matching',
          items: [
            {
              q: 'I already ordered. Can I still claim?',
              a: 'Yes, up to 15 days after your order, with your order number. (Window to confirm.)',
            },
            {
              q: 'Does it apply to sale prices?',
              a: 'It applies to published prices from authorized sellers. Clearance, closeouts, coupon codes and marketplace listings are excluded.',
            },
            {
              q: 'Can I use financing on a matched price?',
              a: 'Yes. Price-matched orders can still use 0% financing on qualifying orders.',
            },
          ],
        }}
      />
      <FinePrint>
        Program terms, the claim window and the form of the $500 reward are to be confirmed by
        Express Kitchens before launch.
      </FinePrint>
    </>
  );
}
