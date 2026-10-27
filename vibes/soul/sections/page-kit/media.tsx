import { clsx } from 'clsx';
import { Play, Star } from 'lucide-react';

import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { type CustomerReview } from '@/vibes/soul/sections/review-carousel';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { type Project, projectHref, type Video } from '~/lib/pages/projects';

import { VideoTile } from './video-tile';

// Photo tiles for finished kitchens: photo, title, collection line, cost. Tall by default; `compact`
// for the three-up "featured" row.
export function ProjectGrid({
  kicker,
  title,
  description,
  projects,
  action,
  columns = 3,
  tint,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  projects: Project[];
  action?: { label: string; href: string };
  columns?: 2 | 3 | 4;
  tint?: boolean;
}) {
  return (
    <HomeSection
      action={action}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <ul
        className={clsx(
          'grid gap-5',
          {
            2: '@xl:grid-cols-2',
            3: '@xl:grid-cols-2 @4xl:grid-cols-3',
            4: '@xl:grid-cols-2 @4xl:grid-cols-4',
          }[columns],
        )}
      >
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              className="group block overflow-hidden rounded-3xl border border-contrast-100 bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              href={projectHref(project.slug)}
            >
              <span className="relative block aspect-[4/3] bg-contrast-100">
                {project.image ? (
                  <Image
                    alt={project.image.alt}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    fill
                    sizes="(min-width: 64rem) 25vw, (min-width: 36rem) 50vw, 100vw"
                    src={project.image.src}
                  />
                ) : (
                  <MediaPlaceholder label={project.imageLabel} />
                )}
              </span>
              <span className="block p-5">
                <span className="block font-heading text-lg font-semibold leading-tight">
                  {project.title}
                </span>
                <span className="mt-1 block text-sm text-contrast-500">{project.meta}</span>
                <span className="mt-1 block text-sm font-medium">{project.cost}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

// A masonry-ish gallery of photos only (two row heights) — the Inspiration landing.
export function PhotoGallery({
  title,
  description,
  items,
  tint,
}: {
  title?: string;
  description?: string;
  items: Array<{ label: string; meta: string; href: string }>;
  tint?: boolean;
}) {
  return (
    <HomeSection description={description} tint={tint} title={title}>
      <ul className="grid grid-cols-2 gap-4 @xl:grid-cols-3 @4xl:grid-cols-4">
        {items.map((item, index) => (
          <li className={clsx(index % 5 === 0 && '@xl:row-span-2')} key={`${item.label}-${index}`}>
            <Link
              className="group relative block h-full min-h-[180px] overflow-hidden rounded-2xl bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              href={item.href}
            >
              <MediaPlaceholder label={item.label} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.meta}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

// Video tiles: thumbnail with a play mark, title, meta and duration.
export function VideoGrid({
  kicker,
  title,
  description,
  videos,
  action,
  columns = 3,
  tint,
  compact,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  videos: Video[];
  action?: { label: string; href: string };
  columns?: 2 | 3 | 4 | 5;
  tint?: boolean;
  compact?: boolean;
}) {
  return (
    <HomeSection
      action={action}
      compact={compact}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <ul
        className={clsx(
          'grid gap-6',
          {
            2: '@xl:grid-cols-2',
            3: '@xl:grid-cols-2 @4xl:grid-cols-3',
            4: 'grid-cols-2 @4xl:grid-cols-4',
            5: 'grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-5',
          }[columns],
        )}
      >
        {videos.map((video) => (
          <li key={video.youtubeId ?? video.title}>
            {video.youtubeId ? (
              <VideoTile video={{ ...video, youtubeId: video.youtubeId }} />
            ) : (
              <Link
                className="group block focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                href={video.href ?? '#'}
              >
                <span className="relative block aspect-video overflow-hidden rounded-2xl bg-contrast-100">
                  <MediaPlaceholder label="" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md transition-transform group-hover:scale-110">
                      <Play aria-hidden className="ml-0.5" size={20} strokeWidth={2.5} />
                    </span>
                  </span>
                  {video.duration ? (
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {video.duration}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2.5 block text-sm font-semibold leading-snug">
                  {video.title}
                </span>
                {Boolean(video.meta) && (
                  <span className="mt-0.5 block text-xs text-contrast-500">{video.meta}</span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

// Review cards in a grid — the full reviews page.
export function ReviewGrid({
  reviews,
  title,
  description,
  action,
  tint,
}: {
  reviews: CustomerReview[];
  title?: string;
  description?: string;
  action?: { label: string; href: string };
  tint?: boolean;
}) {
  return (
    <HomeSection action={action} description={description} tint={tint} title={title}>
      <ul className="grid gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
        {reviews.map((review) => (
          <li
            className="flex flex-col rounded-3xl border border-contrast-100 bg-white p-6"
            key={review.name + review.quote.slice(0, 20)}
          >
            <span
              aria-label={`${review.stars} out of 5 stars`}
              className="flex gap-0.5 text-[var(--button-primary-background,#d90716)]"
              role="img"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  aria-hidden
                  fill={i < review.stars ? 'currentColor' : 'none'}
                  key={i}
                  size={15}
                  strokeWidth={1.5}
                />
              ))}
            </span>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed">{review.quote}</blockquote>
            <p className="mt-4 text-xs text-contrast-500">
              <span className="font-semibold text-foreground">{review.name}</span>
              {Boolean(review.location) && ` · ${review.location}`}
              {Boolean(review.source) && ` · ${review.source}`}
            </p>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
