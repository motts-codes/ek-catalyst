import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose, StatsRow } from '@/vibes/soul/sections/page-kit';
import { ProjectGrid } from '@/vibes/soul/sections/page-kit/media';
import { industryFields } from '~/lib/forms/industry-fields';
import { submitIndustryLead } from '~/lib/forms/submit-lead';
import { PROJECTS } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'Multifamily Kitchens — Five-Day Delivery',
  description:
    'Kitchens in five days from 50,000+ in-stock cabinets, so your units are back on the market sooner. 100,000+ units delivered to 300+ property managers.',
};

export default async function Multifamily({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Industry', href: '/industry' },
          { label: 'Multifamily', href: '/industry/multifamily' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Request portfolio pricing', href: '#talk', primary: true },
          { label: 'See unit packages', href: '#packages' },
        ]}
        chips={['100,000+ units delivered', '300+ property managers', '5-day standard']}
        description="Every day a unit sits empty during a renovation is rent you'll never get back. We deliver complete kitchens in five days from more than 50,000 cabinets in stock, so your units are back on the market before most suppliers' orders have even shipped. One spec per unit type, one PO, one accountable partner."
        imageLabel="A finished apartment kitchen, one of many identical units"
        kicker="Multifamily"
        title="Five-day kitchens. Fewer vacant days. More rental income."
      />
      <DeliveryLadder
        columns={['', 'Industry standard', 'Express Kitchens']}
        description="Based on $2,500 a month average rent. Your portfolio math will vary, and we'll calculate it for you: at this rent, that's $7,705 recovered per unit, times your units."
        rows={[
          ['!Wait time', '14 weeks for cabinets', '5 days to delivery'],
          ['!Vacancy cost', '$8,120 lost rent', '$415 vacancy'],
          ['!Per unit at', '$2,500/mo', '$2,500/mo'],
        ]}
        tint
        title="The math that matters"
      />
      <StatsRow
        stats={[
          { value: '100,000+', label: 'multifamily units delivered' },
          { value: '300+', label: 'property managers' },
          { value: '5-day', label: 'delivery standard' },
          { value: '50,000+', label: 'cabinets in stock now' },
        ]}
      />
      <Prose
        body={[
          "Your tenants need to move in and your owners need occupancy up, and nobody should be waiting 14 weeks for cabinets while perfectly good units sit empty. That isn't how a supply chain should work; it's how a broken one does. So we built a different kind of operation: 50,000 cabinets in stock, all-plywood construction on every one, and a team that understands what each vacant day costs you.",
        ]}
        kicker="Our belief"
        tint
        title="The kitchen supplier should be the fastest part of your renovation, not the bottleneck"
      />
      <div id="packages" />
      <CardsRow
        cards={[
          {
            title: 'Studio / 1BR — from $2,800',
            description:
              '8–12 cabinets per unit. Base and wall cabinet set, laminate countertop included, standard sink cutout, soft-close hinges as standard.',
          },
          {
            title: '2BR standard — from $4,200 · most popular',
            description:
              '14–18 cabinets per unit. Expanded cabinet configuration, a choice of three countertop materials, an appliance bundle available, all-plywood construction.',
          },
          {
            title: 'Luxury / 3BR — from $6,500',
            description:
              '20–28 cabinets per unit. Full kitchen redesign, solid-surface countertops, premium hardware upgrade and a custom layout consultation.',
          },
        ]}
        description="Pre-configured packages cut decision time and speed quote-to-order: cabinets, countertops and appliances on one PO. All packages are all-plywood construction; custom configurations for 50+ unit orders."
        hideImages
        kicker="Apartment kitchen packages"
        title="Three packages, one PO"
      />
      <Prose
        body={['UDR · Related Companies · Equity Residential · WinnCompanies · Konover']}
        kicker="Trusted by"
        tint
        title="Property managers who order here"
      />
      <ProjectGrid
        action={{ label: 'All multifamily projects', href: '/inspiration/projects' }}
        projects={PROJECTS.filter((p) => p.industry === 'Multifamily').slice(0, 3)}
        title="Recent projects"
      />
      <CabinetFaq
        data={{
          headline: 'Questions from property managers',
          items: [
            {
              q: 'We need consistent quality across 200+ units. Can you deliver that?',
              a: "We've delivered 100,000+ multifamily units. Every cabinet is all-plywood construction from the same production line, so you get the same quality in unit #1 and unit #247. That's what standardized inventory and vertical integration are for.",
            },
            {
              q: 'Our last cabinet supplier delayed the project by six weeks.',
              a: "That's exactly why we stock 50,000+ cabinets. We don't manufacture to order for multifamily; we deliver from inventory. Five-day delivery is our standard, not a marketing promise.",
            },
            {
              q: "We're worried about coordinating cabinets, countertops and installation separately.",
              a: "We make our own countertops and stock our own cabinets, and we coordinate delivery around your installation crew's schedule. One company, one PO, one point of accountability for everything we supply.",
            },
            {
              q: 'What if we need different configurations for different unit types?',
              a: 'Our pre-configured packages cover studios through three-bedrooms, and for 50+ unit orders we build custom configurations per unit type, priced per unit.',
            },
          ],
        }}
      />
      <HomeSection
        description="Tell us the unit count and timeline and we'll come back with portfolio pricing. Or call 860-247-1000."
        id="talk"
        kicker="Talk to us"
        tint
        title="Request portfolio pricing"
      >
        <div className="rounded-3xl border border-contrast-100 bg-white p-6 @xl:p-10">
          <DynamicFormSection
            action={submitIndustryLead}
            fields={industryFields('Project — number of units')}
            submitLabel="Send"
          />
        </div>
      </HomeSection>
    </>
  );
}
