import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { BlogPostCard, BlogPostCardBlogPost } from '@/vibes/soul/primitives/blog-post-card';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselControls,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { HomeSection } from '@/vibes/soul/sections/home-section';

interface Props {
  kicker?: string;
  title?: string;
  action?: { label: string; href: string };
  posts: Streamable<BlogPostCardBlogPost[]>;
  tint?: boolean;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
  scrollbarLabel?: string;
}

// "Inspiration and insights" — the latest blog posts, four at a time, dots left and arrows right.
// Renders nothing when the blog has no posts.
export function BlogPostCarousel({
  kicker,
  title = 'Inspiration and insights',
  action,
  posts,
  tint = false,
  className,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  scrollbarLabel = 'Scroll articles',
}: Props) {
  return (
    <Stream
      fallback={
        <HomeSection
          action={action}
          className={className}
          kicker={kicker}
          tint={tint}
          title={title}
        >
          <Skeleton.Root pending>
            <div className="grid gap-5 @lg:grid-cols-2 @3xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton.Box className="aspect-[4/3] rounded-2xl" key={index} />
              ))}
            </div>
          </Skeleton.Root>
        </HomeSection>
      }
      value={posts}
    >
      {(resolved) =>
        resolved.length === 0 ? null : (
          <HomeSection
            action={action}
            className={className}
            kicker={kicker}
            tint={tint}
            title={title}
          >
            <Carousel>
              <CarouselContent className="-ml-3 @2xl:-ml-4">
                {resolved.map((post) => (
                  <CarouselItem
                    className="basis-full pl-3 @lg:basis-1/2 @2xl:pl-4 @3xl:basis-1/4"
                    key={post.id}
                  >
                    <BlogPostCard blogPost={post} variant="compact" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselControls>
                <CarouselScrollbar label={scrollbarLabel} />
                <CarouselButtons nextLabel={nextLabel} previousLabel={previousLabel} />
              </CarouselControls>
            </Carousel>
          </HomeSection>
        )
      }
    </Stream>
  );
}
