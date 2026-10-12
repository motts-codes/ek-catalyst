import { Streamable } from '@/vibes/soul/lib/streamable';
import { BlogPostCardBlogPost } from '@/vibes/soul/primitives/blog-post-card';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { BlogPostList } from '@/vibes/soul/sections/blog-post-list';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Link } from '~/components/link';

export interface BlogFilterChip {
  label: string;
  href: string;
  active?: boolean;
}

interface Props {
  /** Small line above the headline, e.g. "Blog". */
  kicker?: string;
  title: string;
  description?: string;
  /** Topic chips under the intro (All, Guide, Trends…). */
  filters?: BlogFilterChip[];
  posts: Streamable<BlogPostCardBlogPost[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  breadcrumbs?: Streamable<Breadcrumb[]>;
  emptyStateSubtitle?: Streamable<string | null>;
  emptyStateTitle?: Streamable<string | null>;
  placeholderCount?: number;
}

export function FeaturedBlogPostList({
  kicker,
  title,
  description,
  filters = [],
  posts,
  paginationInfo,
  breadcrumbs,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount,
}: Props) {
  return (
    <SectionLayout>
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

      <div className="pt-6">
        {/* Headline left, intro right, then the topic chips. */}
        <div className="grid gap-6 @3xl:grid-cols-[1.1fr_1fr] @3xl:items-end @3xl:gap-16">
          <div>
            {Boolean(kicker) && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
                {kicker}
              </p>
            )}
            <h1 className="font-heading text-3xl font-bold leading-tight text-foreground @xl:text-4xl @4xl:text-[44px]">
              {title}
            </h1>
          </div>
          {description != null && description !== '' && (
            <p className="max-w-xl text-base leading-relaxed text-contrast-500 @xl:text-lg">
              {description}
            </p>
          )}
        </div>

        {filters.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {filters.map((chip) => (
              <li key={chip.label}>
                <Link
                  aria-current={chip.active ? 'page' : undefined}
                  className={
                    chip.active
                      ? 'inline-flex items-center rounded-full border border-foreground bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white'
                      : 'inline-flex items-center rounded-full border border-contrast-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-contrast-500 transition-colors hover:border-foreground hover:text-foreground'
                  }
                  href={chip.href}
                >
                  {chip.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <BlogPostList
          className="mb-8 mt-8 @4xl:mb-10 @4xl:mt-10"
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          placeholderCount={placeholderCount}
          posts={posts}
        />

        {paginationInfo && <CursorPagination info={paginationInfo} />}
      </div>
    </SectionLayout>
  );
}
