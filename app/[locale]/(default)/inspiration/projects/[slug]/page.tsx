import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { LinkCards, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { ProjectGrid } from '@/vibes/soul/sections/page-kit/media';
import { Link } from '~/components/link';
import { getProject, PROJECTS } from '~/lib/pages/projects';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);

  // Projects are hidden at the client's request (27 Oct 2026): still reachable, not indexed.
  return project
    ? {
        title: `${project.title} — ${project.meta}`,
        description: project.summary,
        robots: { index: false },
      }
    : {};
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const project = getProject(slug);

  if (!project) return notFound();

  const index = PROJECTS.indexOf(project);
  const previous = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const more = PROJECTS.filter((p) => p.slug !== slug && p.industry === project.industry).slice(
    0,
    3,
  );

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Inspiration', href: '/inspiration' },
          { label: 'Projects', href: '/inspiration/projects' },
          { label: project.title, href: `/inspiration/projects/${slug}` },
        ]}
      />
      <PageHero
        chips={[project.collection, project.finish, project.program, project.cost]}
        description={project.summary}
        imageLabel={project.imageLabel}
        kicker={project.industry}
        textOnly
        title={`${project.title} — ${project.collection}, ${project.finish}, ${project.program}`}
      />
      <HomeSection compact tint title="Before and after">
        <div className="grid gap-4 @xl:grid-cols-2">
          {['Before', 'After'].map((label) => (
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100"
              key={label}
            >
              <MediaPlaceholder label={label} />
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 @xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-contrast-100"
              key={n}
            >
              <MediaPlaceholder label={`Photo ${n}`} />
            </div>
          ))}
        </div>
      </HomeSection>
      <Prose body={project.story} kicker="The story" title="How it happened" />
      {project.products.length > 0 && (
        <LinkCards
          cards={project.products.map((p) => ({
            title: p.name,
            description: p.meta,
            href: p.href,
            linkLabel: 'See it',
          }))}
          columns={4}
          description="The actual collection and products in this kitchen, with their prices."
          kicker="Get this look"
          tint
          title="What's in it"
        />
      )}
      {project.quote != null && (
        <HomeSection compact>
          <blockquote className="max-w-3xl font-heading text-xl font-semibold leading-snug @xl:text-2xl">
            “{project.quote.text}”
          </blockquote>
          <p className="mt-3 text-sm text-contrast-500">— {project.quote.name}</p>
        </HomeSection>
      )}
      {previous != null && next != null && (
        <HomeSection compact tint>
          <div className="flex flex-wrap justify-between gap-4 text-sm font-semibold">
            <Link
              className="underline-offset-4 hover:underline"
              href={`/inspiration/projects/${previous.slug}`}
            >
              ← {previous.title}
            </Link>
            <Link
              className="underline-offset-4 hover:underline"
              href={`/inspiration/projects/${next.slug}`}
            >
              {next.title} →
            </Link>
          </div>
        </HomeSection>
      )}
      {more.length > 0 && <ProjectGrid projects={more} title="More like this" />}
    </>
  );
}
