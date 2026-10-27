import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { LinkCards, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ProjectGrid } from '@/vibes/soul/sections/page-kit/media';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { getAudienceMode } from '~/lib/navigation/audience-mode';
import { PROJECTS } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Every kitchen we have finished: homes, apartment buildings, hotels and offices. Each one names the collection and finish, with the story, the cabinet list and what it cost.',
  // Hidden at the client's request (27 Oct 2026): out of the nav, footer and sitemap, not indexed.
  robots: { index: false },
};

export default async function Projects({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const pro = (await getAudienceMode()) === 'pro';
  const projects = pro
    ? PROJECTS.filter((p) => p.industry !== 'Residential')
    : PROJECTS.filter((p) => p.industry === 'Residential');

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Inspiration', href: '/inspiration' },
          { label: 'Projects', href: '/inspiration/projects' },
        ]}
      />
      <PageHero
        actions={[
          {
            label: pro ? 'Free design & quote' : 'Free design consult',
            href: FREE_DESIGN_HREF,
            primary: true,
          },
        ]}
        description={
          pro
            ? "Apartment buildings, senior living, hotels and offices we've fitted out across the Northeast. Each project shows the collection, the program, the unit count and the per-unit cost, so you can see what we've delivered at your scale before you send us a scope."
            : 'Every kitchen here was finished for a family in Connecticut. Each one tells you the collection, the finish and whether it was ready to assemble or assembled, and the story inside shows you the cabinet list and what it cost, so you can picture your own.'
        }
        image={
          pro
            ? {
                src: '/images/pages/industry/apartment-kitchen-units.jpg',
                alt: 'A finished apartment kitchen, the next identical unit visible beyond',
              }
            : {
                src: '/images/pages/inspiration/connecticut-kitchen-wide.jpg',
                alt: 'A finished white shaker kitchen with an island and French doors',
              }
        }
        imageLabel={
          pro ? 'A finished multifamily kitchen, wide' : 'A finished Connecticut kitchen, wide'
        }
        kicker="Projects"
        title={
          pro ? 'Multifamily and commercial projects' : 'Finished kitchens, and what they cost'
        }
      />
      <ProjectGrid
        description="Photo first, then the collection, finish, program and cost. The story is one click in."
        projects={projects}
        tint
        title={pro ? 'Recent projects' : 'Finished kitchens'}
      />
      {pro && (
        <LinkCards
          cards={[
            {
              title: 'Free design & quote',
              description:
                'Send the plans; we return a layout, a cabinet list and a price you can put in front of your client.',
              href: FREE_DESIGN_HREF,
            },
            {
              title: 'Multifamily',
              description: 'One spec per unit type, priced per unit, delivered floor by floor.',
              href: '#',
            },
            {
              title: 'Commercial',
              description: 'Offices, medical, hospitality and institutional, spec-sheet ready.',
              href: '#',
            },
          ]}
          columns={3}
          kicker="Bring us a scope"
          title="Ready when you are"
        />
      )}
      {!pro && (
        <ClosingBand
          primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
          showrooms={SHOWROOMS}
        />
      )}
    </>
  );
}
