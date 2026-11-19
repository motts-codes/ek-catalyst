import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';

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
  /** Short label over the title: the post's first tag, when it has one. */
  label?: string;
}

interface Props {
  blogPost: BlogPostCardBlogPost;
  /**
   * `compact`: the home-page version — "tag · date" over a two-line bold title, no summary
   * or author. `list`: the blog page card — bordered, red label eyebrow, bold title, summary and
   * a "Read more" button.
   */
  variant?: 'default' | 'compact' | 'list';
  className?: string;
}

export function BlogPostCard({ blogPost, variant = 'default', className }: Props) {
  const { author, content, date, href, image, label, title } = blogPost;
  const compact = variant === 'compact';
  const list = variant === 'list';

  if (list) {
    return (
      <Link
        className={clsx(
          'group flex h-full max-w-full flex-col overflow-hidden rounded-3xl border border-contrast-100 bg-white text-foreground transition-[transform,box-shadow] duration-300 ease-out @container hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus:outline-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
          className,
        )}
        href={href}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-contrast-100">
          {image?.src != null && image.src !== '' ? (
            <Image
              alt={image.alt}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              fill
              sizes="(min-width: 56rem) 33vw, (min-width: 28rem) 50vw, 100vw"
              src={image.src}
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-6 @xl:p-7">
          {/* Always rendered, so titles line up across cards whether or not the post has a tag. */}
          <p className="min-h-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--button-primary-background,#d90716)]">
            {label}
          </p>
          <h3 className="mt-3 font-heading text-xl font-bold leading-snug transition-colors group-hover:text-[var(--button-primary-background,#d90716)] @xl:text-2xl">
            {title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {content}
          </p>
          <div className="mt-auto flex items-center justify-between gap-4 pt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-[var(--button-primary-background,#d90716)]">
              Read more
              <ArrowRight aria-hidden size={16} strokeWidth={2} />
            </span>
            <time className="text-xs text-contrast-500" dateTime={date}>
              {date}
            </time>
          </div>
        </div>
      </Link>
    );
  }

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
            {label != null && label !== '' && `${label} · `}
            <time dateTime={date}>{date}</time>
          </p>
          <h3 className="mt-1.5 line-clamp-2 font-heading text-lg font-bold leading-snug transition-colors group-hover:text-[var(--button-primary-background,#d90716)]">
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
