import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FormCard, PageBreadcrumbs, PageHero, StatsRow } from '@/vibes/soul/sections/page-kit';
import { ProjectGrid } from '@/vibes/soul/sections/page-kit/media';
import { industryFields } from '~/lib/forms/industry-fields';
import { submitIndustryLead } from '~/lib/forms/submit-lead';
import { PROJECTS } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'Commercial Division — WBE / MBE Certified',
  description:
    'Vertically integrated manufacturing, a 50,000-cabinet inventory and $40M+ in delivered commercial projects. Schedule certainty for GCs and developers.',
};

export default async function Commercial({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Industry', href: '/industry' },
          { label: 'Commercial', href: '/industry/commercial' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Request project consultation', href: '#talk', primary: true },
          { label: 'Download capabilities PDF', href: '#' },
        ]}
        chips={['WBE / MBE certified', '$40M+ delivered', '50,000+ cabinets in stock']}
        description="Cabinet delays shouldn't be the reason your project misses its date. Because we manufacture, stock and deliver from our own facilities, we can commit to a delivery date and keep it, and more than $40 million in delivered commercial work is the proof. Send us the scope and you'll have detailed pricing back within 48 hours."
        imageLabel="A commercial site, cabinets being delivered on schedule"
        kicker="Commercial division"
        title="Schedule certainty, from the people who make the cabinets"
      />
      <StatsRow
        stats={[
          { value: '$40M+', label: 'commercial delivered' },
          { value: '50,000+', label: 'cabinets in stock' },
          { value: '100K+', label: 'multifamily units' },
          { value: '110', label: 'years of heritage' },
          { value: 'WBE / MBE', label: 'certified' },
        ]}
        tint
      />
      <CardsRow
        cards={[
          {
            title: 'Schedule certainty',
            description:
              'Vertically integrated manufacturing plus a 50,000-cabinet inventory means we commit to dates and deliver. No supply-chain roulette.',
          },
          {
            title: 'Value engineering',
            description:
              'We help you hit budget without cutting quality: all-plywood construction at price points that make your proforma work.',
          },
          {
            title: 'Single source',
            description:
              'Design, manufacturing, countertops and delivery under one roof. One point of contact, one accountable partner.',
          },
          {
            title: 'Scale ready',
            description:
              'From 50-unit projects to 500+, with inventory and manufacturing capacity that scales with your timeline.',
          },
          {
            title: 'WBE / MBE certified',
            description:
              "A certified Women's and Minority Business Enterprise, meeting diversity requirements for government and institutional projects.",
          },
          {
            title: '110-year track record',
            description:
              'Star Hardware 1916. Kothari family 1989. Express Kitchens 2002. Four generations of keeping promises.',
          },
        ]}
        columns={3}
        hideImages
        kicker="The advantage"
        title="We eliminated the variable that delays your projects"
      />
      <DeliveryLadder
        columns={['Client', 'Type', 'Project']}
        rows={[
          ['!Gilbane', 'General contractor', 'Multi-state'],
          ['!AvalonBay', 'Developer', 'Mixed-use'],
          ['!Related Companies', 'Developer', 'Luxury residential'],
          ['!HUD', 'Government', 'Public housing'],
          ['!Enterprise Builders', 'General contractor', 'Commercial'],
          ['!KBE Building Corp', 'General contractor', 'Pinnacle, Steel Pointe'],
          ['!Konover', 'Developer', 'Rose Hill'],
          ['!Viking Construction', 'General contractor', 'Wall Street'],
        ]}
        tint
        title="Trusted by the companies that can't afford cabinet delays"
      />
      <CardsRow
        cards={[
          {
            title: '01 · Scope review',
            description:
              'Submit plans and specifications. Our commercial team reviews the scope, identifies value-engineering opportunities and returns detailed pricing within 48 hours.',
          },
          {
            title: '02 · Specification & VE',
            description:
              'We finalize specifications that meet project requirements while optimizing the budget. All-plywood construction, multiple finishes, custom sizing available.',
          },
          {
            title: '03 · Scheduled delivery',
            description:
              "Delivery dates locked to your construction schedule. Our inventory means we're not waiting on manufacturing: your cabinets are ready when your site is.",
          },
          {
            title: '04 · Delivery and coordination',
            description:
              'Scheduled delivery to site, coordinated with your GC or installer. One point of contact from order through completion, and after it.',
          },
        ]}
        columns={4}
        hideImages
        kicker="Process"
        title="From scope to delivery"
      />
      <ProjectGrid
        action={{ label: 'All commercial projects', href: '/inspiration/projects' }}
        projects={PROJECTS.filter((p) => p.industry === 'Commercial').slice(0, 3)}
        tint
        title="Recent projects"
      />
      <CabinetFaq
        data={{
          headline: 'Questions we hear from GCs',
          items: [
            {
              q: 'Can you handle a 200+ unit project?',
              a: "We've delivered 100,000+ multifamily units and $40M+ in commercial projects. Our 50,000-cabinet inventory and vertically integrated manufacturing are built for scale; Gilbane, AvalonBay and HUD trust us for exactly this reason.",
            },
            {
              q: 'We need WBE/MBE for this project.',
              a: "Express Kitchens is a certified Women's Business Enterprise and Minority Business Enterprise, and we provide all documentation for government RFPs, institutional projects and diversity-sourcing requirements.",
            },
            {
              q: "How do we know you'll hit the delivery date?",
              a: "Because we don't depend on a third-party supply chain. We manufacture, stock and deliver from our own facilities, so the date we commit to is one we control.",
            },
          ],
        }}
      />
      <HomeSection
        description="Send the scope and timeline and our commercial team will come back within 48 hours. Or call 860-247-1000."
        id="talk"
        kicker="Talk to us"
        title="Request a project consultation"
      >
        <FormCard>
          <DynamicFormSection
            action={submitIndustryLead}
            fields={industryFields('Project — scope')}
            submitLabel="Send"
          />
        </FormCard>
      </HomeSection>
    </>
  );
}
