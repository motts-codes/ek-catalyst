import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

interface Tag {
  label: string;
  link: {
    href: string;
    target?: string;
  };
}

interface Image {
  src: string;
  alt: string;
}

export interface TocItem {
  id: string;
  text: string;
}

export interface BlogPostContentBlogPost {
  title: string;
  author?: string;
  date: string;
  tags?: Tag[];
  content: string;
  image?: Image;
  /** "On this page" entries, one per h2 in the content (ids must match). */
  toc?: TocItem[];
}

interface Props {
  blogPost: Streamable<BlogPostContentBlogPost>;
  breadcrumbs?: Streamable<Breadcrumb[]>;
  className?: string;
}

const containerClassName = 'mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14';

// A blog post: the category-page hero (title and meta on the closing-band red, the post photo
// beside it), then the article with an "On this page" list in a sticky left column and the
// prose on the right.
export function BlogPostContent({
  blogPost: streamableBlogPost,
  className = '',
  breadcrumbs,
}: Props) {
  return (
    <section className={clsx('@container', className)}>
      <Stream fallback={<BlogPostContentSkeleton />} value={streamableBlogPost}>
        {(blogPost) => {
          const { title, author, date, tags, content, image, toc = [] } = blogPost;

          return (
            <>
              {breadcrumbs && (
                <div className={clsx(containerClassName, 'pt-4')}>
                  <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
              )}

              {/* Hero: the category-page split, on the closing-band red. */}
              <div className={clsx(containerClassName, 'pt-3')}>
                <div className="grid overflow-hidden rounded-3xl @3xl:grid-cols-2">
                  <div className="flex flex-col justify-center bg-[#9f3632] px-6 py-9 text-white @xl:px-10 @xl:py-12 @4xl:px-14">
                    <h1 className="m-0 max-w-[22ch] font-heading text-[26px] font-bold leading-tight @xl:text-4xl">
                      {title}
                    </h1>
                    <p className="mt-4 text-sm text-white/85">
                      <time dateTime={date}>{date}</time>
                      {Boolean(author) && <> · {author}</>}
                    </p>
                    {(tags?.length ?? 0) > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {tags?.map((tag) => (
                          <li key={tag.label}>
                            <Link
                              className="inline-flex items-center rounded-full border border-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white hover:text-foreground"
                              href={tag.link.href}
                            >
                              {tag.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="relative min-h-[200px] bg-contrast-100 @3xl:min-h-[320px]">
                    {image?.src != null && image.src !== '' && (
                      <Image
                        alt={image.alt}
                        className="object-cover"
                        fill
                        preload
                        sizes="(min-width: 56rem) 50vw, 100vw"
                        src={image.src}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Article: "On this page" on the left (sticky), prose on the right. */}
              <div className={clsx(containerClassName, 'py-10 @xl:py-14')}>
                <div className="grid gap-10 @3xl:grid-cols-[260px_minmax(0,1fr)] @3xl:gap-16 @5xl:grid-cols-[300px_minmax(0,1fr)]">
                  {toc.length > 0 && (
                    <nav
                      aria-label="On this page"
                      className="@3xl:sticky @3xl:top-28 @3xl:self-start @3xl:border-l @3xl:border-contrast-100 @3xl:pl-6"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-contrast-500">
                        On this page
                      </p>
                      <ol className="mt-4 space-y-2.5 text-sm">
                        {toc.map((item) => (
                          <li key={item.id}>
                            <a
                              className="block text-contrast-500 transition-colors hover:text-[var(--button-primary-background,#d90716)] focus-visible:text-[var(--button-primary-background,#d90716)] focus-visible:outline-none"
                              href={`#${item.id}`}
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}
                  <article
                    className={clsx(
                      'prose prose-lg max-w-[68ch] text-[#404040] prose-p:leading-relaxed prose-a:text-[var(--button-primary-background,#d90716)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[var(--button-primary-background,#d90716)] prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-foreground prose-strong:text-foreground prose-li:leading-relaxed prose-img:mx-auto prose-img:h-auto prose-img:w-auto prose-img:max-w-full prose-img:rounded-2xl prose-img:object-contain @3xl:prose-img:max-h-[360px]',
                      // Section titles: Gilroy bold, our size, with room to jump to from the list.
                      '[&_h2:first-child]:mt-0 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-foreground @xl:[&_h2]:text-3xl',
                      '[&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-foreground',
                      toc.length === 0 && '@3xl:col-span-2',
                    )}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              </div>
            </>
          );
        }}
      </Stream>
    </section>
  );
}

function BlogPostContentSkeleton() {
  return (
    <div className={clsx(containerClassName, 'pt-4')}>
      <BreadcrumbsSkeleton />
      <div className="mt-3 grid animate-pulse overflow-hidden rounded-3xl @3xl:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 bg-contrast-100 px-6 py-9 @xl:px-10 @xl:py-12">
          <div className="h-9 w-5/6 rounded-lg bg-contrast-200/60 @xl:h-12" />
          <div className="h-9 w-3/5 rounded-lg bg-contrast-200/60 @xl:h-12" />
          <div className="h-4 w-1/3 rounded-lg bg-contrast-200/60" />
        </div>
        <div className="min-h-[200px] bg-contrast-200/40 @3xl:min-h-[320px]" />
      </div>
      <div className="grid gap-10 py-10 @xl:py-14 @3xl:grid-cols-[260px_minmax(0,1fr)] @3xl:gap-16">
        <div className="hidden space-y-3 @3xl:block">
          <div className="h-3 w-24 rounded bg-contrast-100" />
          <div className="h-4 w-48 rounded bg-contrast-100" />
          <div className="h-4 w-40 rounded bg-contrast-100" />
          <div className="h-4 w-44 rounded bg-contrast-100" />
        </div>
        <div className="max-w-[68ch] space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="h-4 w-full rounded bg-contrast-100" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
