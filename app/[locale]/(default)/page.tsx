import { Metadata } from 'next';
import { getFormatter, setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { BlogPostCarousel } from '@/vibes/soul/sections/blog-post-carousel';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { CollectionCarousel } from '@/vibes/soul/sections/collection-carousel';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { ProductTabs } from '@/vibes/soul/sections/product-tabs';
import { ProgramCards } from '@/vibes/soul/sections/program-cards';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { SamplesCallout } from '@/vibes/soul/sections/samples-callout';
import { ShowroomBand } from '@/vibes/soul/sections/showroom-band';
import { StoryBand } from '@/vibes/soul/sections/story-band';
import {
  getBestSellingProducts,
  getFeaturedProducts,
  getNewestProducts,
  GetProductsResponse,
} from '~/client/queries/get-products';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { locales } from '~/i18n/locales';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import {
  CATEGORY_TILES,
  FREE_DESIGN_HREF,
  HERO_OFFERS,
  HERO_SLIDES,
  HOME_REVIEWS,
  PROGRAM_CARDS,
  PROGRAM_FOOTNOTE,
  SAMPLES_HREF,
  SHOWROOMS,
  STORY,
  THREE_WAYS,
} from '~/lib/home/home-content';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { EditableSection } from '~/lib/makeswift/components/editable-section';
import { CATEGORY_CAROUSEL_TYPE, HERO_SPLIT_TYPE } from '~/lib/makeswift/components/section-types';
import { Slot } from '~/lib/makeswift/slot';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { getBlogPosts } from './blog/page-data';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await getMakeswiftPageMetadata({ path: '/', locale });

  return {
    title: metadata?.title ?? 'Express Kitchens — Kitchen cabinets made in Connecticut',
    description:
      metadata?.description ??
      'Kitchen cabinets built in Connecticut and stocked in Bristol. RTA in two weeks, assembled in three — plus countertops, sinks, appliances and windows from one supplier.',
    alternates: await getMetadataAlternates({ path: '/', locale }),
  };
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

type CollectionLoader = (args: {
  locale?: string;
}) => Promise<{ status: string; products?: GetProductsResponse; error?: string }>;

// Home page — wireframe Option B, "E-commerce first": categories, prices and the offer above the
// fold, the story further down.
//
// Every editorial band is a Makeswift <Slot> whose fallback renders the wireframe content from
// lib/home/home-content.ts, so the page is complete now and marketing can replace any band in the
// builder later. The catalog-driven sections ("Shop what's moving", best-seller collections, the
// articles row) are code-only and read live store data.
export default async function Home({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const format = await getFormatter();

  // Raw product collections (shared by the tabs and the derived "On sale" tab).
  const loadCollection = (loader: CollectionLoader) =>
    Streamable.from(async () => {
      const result = await loader({ locale });

      return result.products ?? [];
    });

  const rawFeatured = loadCollection(getFeaturedProducts);
  const rawNewest = loadCollection(getNewestProducts);
  const rawBestSelling = loadCollection(getBestSellingProducts);

  const toCards = (raw: Streamable<GetProductsResponse>) =>
    Streamable.from(async () => productCardTransformer(await raw, format));

  // "On sale" = any product across the three collections whose sale price is below its base
  // price (deduplicated). No separate store query exists for this yet.
  const onSale = Streamable.from(async () => {
    const seen = new Set<number>();
    const all = [...(await rawFeatured), ...(await rawNewest), ...(await rawBestSelling)];
    const sale = all.filter((product) => {
      if (seen.has(product.entityId)) return false;

      seen.add(product.entityId);

      const base = product.pricesExcludingTax?.basePrice?.value;
      const salePrice = product.pricesExcludingTax?.salePrice?.value;

      return base != null && salePrice != null && salePrice < base;
    });

    return productCardTransformer(sale, format);
  });

  const productTabs = [
    { id: 'trending', label: 'Trending', products: toCards(rawFeatured) },
    { id: 'new', label: 'New', products: toCards(rawNewest) },
    { id: 'best-selling', label: 'Best selling', products: toCards(rawBestSelling) },
    { id: 'on-sale', label: 'On sale', products: onSale },
  ];

  // Best-seller collection cards: the assembled program's 10×10 price + ship time, same card as
  // the listing pages.
  const streamableCollections = Streamable.from(async () =>
    (await getCabinetLines('assembled')).slice(0, 12),
  );

  const streamablePosts = Streamable.from(async () => {
    const blog = await getBlogPosts({ tag: null, limit: 8, before: null, after: null });

    return blog?.posts ?? [];
  });

  return (
    <>
      {/* 1 · Hero — 65/35: rotating photos + the offers. Editable in Makeswift ("Home / Hero Split"). */}
      <EditableSection
        defaults={{ slides: HERO_SLIDES, offers: HERO_OFFERS }}
        label="Home hero"
        snapshotId="home-hero-split"
        type={HERO_SPLIT_TYPE}
      />

      {/* 2 · Shop what you're working on (the category tiles) */}
      <EditableSection
        defaults={{ categories: CATEGORY_TILES, tightTop: true }}
        label="Home categories"
        snapshotId="home-category-carousel"
        type={CATEGORY_CAROUSEL_TYPE}
      />

      {/* 3 · Shop what's moving — tabs by reason to buy now, fed by store data */}
      <HomeSection title="Shop what's moving">
        <ProductTabs tabs={productTabs} />
      </HomeSection>

      {/* 4 · Assembled or RTA? */}
      <Slot
        fallback={
          <ProgramCards
            cards={PROGRAM_CARDS}
            footnote={PROGRAM_FOOTNOTE}
            helper={{ label: 'Not sure? Talk to a designer →', href: FREE_DESIGN_HREF }}
          />
        }
        label="Home program cards"
        snapshotId="home-programs"
      />

      {/* 5 · Best sellers — collection cards with the 10×10 price in a carousel, then the samples strip */}
      <HomeSection
        action={{ label: 'All door styles', href: '/cabinets/assembled-cabinets' }}
        kicker="Best sellers"
        tint
        title="The kitchens people order most — with the price"
      >
        <CollectionCarousel lines={streamableCollections} />
        <SamplesCallout className="mt-6" cta={{ label: 'Order samples', href: SAMPLES_HREF }} />
      </HomeSection>

      {/* 6 · Not sure yet? Three ways to be sure. */}
      <Slot
        fallback={
          <CardsRow cards={THREE_WAYS} kicker="Not sure yet?" title="Three ways to be sure" />
        }
        label="Home three ways"
        snapshotId="home-three-ways"
      />

      {/* 7 · Reviews */}
      <Slot
        fallback={
          <ReviewMarquee
            action={{ label: 'Read all reviews', href: '#' }}
            reviews={HOME_REVIEWS}
            summary="4.5 · 360+ Google reviews"
            tint
          />
        }
        label="Home reviews"
        snapshotId="home-reviews"
      />

      {/* 8 · Made in Connecticut — the whole brand story in one band, after the shopping */}
      <Slot
        fallback={
          <StoryBand
            actions={STORY.actions}
            description={STORY.description}
            imageLabel={STORY.imageLabel}
            kicker={STORY.kicker}
            title={STORY.title}
          />
        }
        label="Home story band"
        snapshotId="home-story"
      />

      {/* 9 · Showrooms */}
      <Slot
        fallback={
          <ShowroomBand
            description="A showroom visit turns a saved photo into something you can see, feel, and make your own. Our specialists are ready when you are. Get one-on-one help."
            showrooms={SHOWROOMS}
            tint
          />
        }
        label="Home showrooms"
        snapshotId="home-showrooms"
      />

      {/* 10 · Articles — latest blog posts */}
      <BlogPostCarousel
        action={{ label: 'More articles', href: '/blog' }}
        posts={streamablePosts}
      />

      {/* 11 · Closing band — book, visit, or call */}
      <Slot
        fallback={
          <ClosingBand
            primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
            showrooms={SHOWROOMS}
          />
        }
        label="Home closing band"
        snapshotId="home-closing"
      />
    </>
  );
}
