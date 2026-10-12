import { clsx } from 'clsx';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface BlogPostCardBlogPost {
  id: string;
  author?: string | null;
  content: string;
  date: string;
  image?: {
    src: string;
    alt: string;
  };
  href: string;
  title: string;
}

interface Props {
  blogPost: BlogPostCardBlogPost;
  /**
   * `compact`: the home-page version — "Guide · N min read" over a two-line bold title, no
   * summary, date or author.
   */
  variant?: 'default' | 'compact';
  className?: string;
}

// Rough reading time: the API gives only a summary, not the article, so this scales the summary
// (a typical post runs about twelve times its summary) at ~200 words a minute, 4–12 minutes.
function readMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.min(12, Math.max(4, Math.round((words * 12) / 200)));
}

export function BlogPostCard({ blogPost, variant = 'default', className }: Props) {
  const { author, content, date, href, image, title } = blogPost;
  const compact = variant === 'compact';

  return (
    <Link
      className={clsx(
        'group max-w-full rounded-b-lg rounded-t-2xl text-foreground ring-primary ring-offset-4 @container focus:outline-0 focus-visible:ring-2',
        className,
      )}
      href={href}
    >
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-contrast-100">
        {image?.src != null && image.src !== '' ? (
          <Image
            alt={image.alt}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            fill
            sizes="(min-width: 80rem) 25vw, (min-width: 56rem) 33vw, (min-width: 28rem) 50vw, 100vw"
            src={image.src}
          />
        ) : (
          <div className="p-4 text-5xl font-bold leading-none tracking-tighter text-foreground/15">
            {title}
          </div>
        )}
      </div>

      {compact ? (
        <>
          <p className="text-xs font-semibold text-contrast-500">
            Guide · {readMinutes(content)} min read
          </p>
          <h3 className="mt-1.5 line-clamp-2 font-heading text-lg font-bold leading-snug">
            {title}
          </h3>
        </>
      ) : (
        <>
          <div className="text-lg font-medium leading-snug">{title}</div>
          <p className="mb-3 mt-1.5 line-clamp-3 text-sm font-normal text-contrast-400">
            {content}
          </p>
          <div className="text-sm">
            <time dateTime={date}>{date}</time>
            {date !== '' && author != null && author !== '' && (
              <span className="after:mx-2 after:content-['•']" />
            )}
            {author != null && author !== '' && <span>{author}</span>}
          </div>
        </>
      )}
    </Link>
  );
}

export function BlogPostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('flex max-w-md animate-pulse flex-col gap-2 rounded-xl', className)}>
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-contrast-100" />

      {/* Title */}
      <div className="h-4 w-24 rounded-lg bg-contrast-100" />

      {/* Content */}
      <div className="h-3 w-full rounded-lg bg-contrast-100" />
      <div className="h-3 w-full rounded-lg bg-contrast-100" />
      <div className="h-3 w-1/2 rounded-lg bg-contrast-100" />

      <div className="flex flex-wrap items-center">
        {/* Date */}
        <div className="h-4 w-16 rounded-lg bg-contrast-100" />
        <span className="after:mx-2 after:text-contrast-100 after:content-['•']" />
        {/* Author */}
        <div className="h-4 w-20 rounded-lg bg-contrast-100" />
      </div>
    </div>
  );
}
