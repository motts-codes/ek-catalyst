import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { PhotoGallery, ProjectGrid } from '@/vibes/soul/sections/page-kit/media';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { projectHref, PROJECTS } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'Finished Kitchens — Inspiration',
  description:
    'Real kitchens in Connecticut homes. Every photo names the collection and finish and links to it; open one for the project story.',
  // Hidden at the client's request (27 Oct 2026): out of the nav, footer and sitemap, not indexed.
  robots: { index: false },
};

export default async function Inspiration({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const residential = PROJECTS.filter((p) => p.industry === 'Residential');
  const gallery = Array.from({ length: 12 }).flatMap((_, i) => {
    const project = residential[i % residential.length];

    return project
      ? [{ label: project.title, meta: project.meta, href: projectHref(project.slug) }]
      : [];
  });

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Inspiration', href: '/inspiration' }]} />
      <PageHero
        actions={[
          { label: 'See the projects', href: '/inspiration/projects', primary: true },
          { label: 'Best-selling designs', href: '/inspiration/best-sellers' },
        ]}
        description="These are real kitchens in real Connecticut homes, photographed after the dust settled. Every photo tells you the collection and the finish, so when something catches your eye you can go straight to it. Open any one for the story behind it: what the family wanted, what it cost and how long it took."
        image={{
          src: '/images/pages/inspiration/connecticut-kitchen-wide.jpg',
          alt: 'A finished white shaker kitchen with an island and French doors',
        }}
        imageLabel="A finished Connecticut kitchen, wide"
        kicker="Inspiration"
        title="Kitchens we've finished, in homes like yours"
      />
      <PhotoGallery
        description="Hover or tap a photo for the collection and finish; open it for the project."
        items={gallery}
        tint
        title="The gallery"
      />
      <ProjectGrid
        action={{ label: 'All projects', href: '/inspiration/projects' }}
        projects={residential.slice(0, 3)}
        title="Featured projects"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Seen something you'd like in your own kitchen?"
      />
    </>
  );
}
