import { Metadata } from 'next';
import { getFormatter, setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { BlogPostCarousel } from '@/vibes/soul/sections/blog-post-carousel';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { CollectionCarousel } from '@/vibes/soul/sections/collection-carousel';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { ProductTabs } from '@/vibes/soul/sections/product-tabs';
import { ProgramSplit } from '@/vibes/soul/sections/program-split';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { SamplesCallout } from '@/vibes/soul/sections/samples-callout';
import { ShowroomMapBand } from '@/vibes/soul/sections/showroom-map-band';
import { StoryFilm } from '@/vibes/soul/sections/story-film';
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
  SAMPLES_VIDEO,
  SHOWROOMS,
  STORY,
  THREE_WAYS,
} from '~/lib/home/home-content';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { EditableSection } from '~/lib/makeswift/components/editable-section';
import { CATEGORY_CAROUSEL_TYPE, HERO_SPLIT_TYPE } from '~/lib/makeswift/components/section-types';
import { Slot } from '~/lib/makeswift/slot';
import { SHOWROOMS as SHOWROOM_DETAILS } from '~/lib/pages/showrooms';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { productCardAddToCartAction } from './(faceted)/product-card-add-to-cart';
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
    // Absolute: the home title names the brand itself, so the layout's "- Express Kitchens"
    // suffix is not added again.
    title: {
      // The live site's title, kept for continuity (per Arun, 26 Nov 2026).
      absolute:
        metadata?.title ??
        'Best Kitchen Cabinets Remodelling & Bathroom Vanities | Express Kitchens',
    },
    // Makeswift's description for "/" is a stub ("Express"); only a real sentence overrides ours.
    description:
      (metadata?.description?.trim().length ?? 0) >= 40
        ? metadata?.description
        : 'Upgrade your home with best kitchen remodeling, premium kitchen cabinets, & stylish bathroom vanities. Smart designs, quality craftsmanship, and affordable solutions.',
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
      const price = product.pricesExcludingTax?.price.value;

      // Explicit sale price, or a group discount pulling the selling price under base.
      return (
        base != null && ((salePrice != null && salePrice < base) || (price != null && price < base))
      );
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

      {/* 3 · Assembled or RTA? */}
      <Slot
        fallback={
          <ProgramSplit
            cards={PROGRAM_CARDS}
            footnote={PROGRAM_FOOTNOTE}
            helper={{ label: 'Not sure? Talk to a designer →', href: FREE_DESIGN_HREF }}
          />
        }
        label="Home program cards"
        snapshotId="home-programs"
      />

      {/* 4 · Shop what's moving — tabs by reason to buy now, fed by store data */}
      <HomeSection halfPadding tint title="Shop what's moving">
        <ProductTabs addToCartAction={productCardAddToCartAction} tabs={productTabs} />
      </HomeSection>

      {/* 5 · Best sellers — collection cards with the 10×10 price in a carousel, then the samples strip */}
      <HomeSection
        action={{ label: 'All door styles', href: '/cabinets/assembled-cabinets' }}
        description="Prices shown, no quote needed."
        kicker="Best sellers"
        tint
        title="The kitchens people order most."
      >
        <CollectionCarousel lines={streamableCollections} />
        <SamplesCallout
          className="mb-2 mt-10 @4xl:mt-12"
          cta={{ label: 'Order samples', href: SAMPLES_HREF }}
          video={SAMPLES_VIDEO}
        />
      </HomeSection>

      {/* 6 · Not sure yet? Three ways to be sure. */}
      <Slot
        fallback={
          <CardsRow
            cards={THREE_WAYS}
            imageStyle="plain"
            kicker="Not sure yet?"
            title="Pick the way you like to decide."
          />
        }
        label="Home three ways"
        snapshotId="home-three-ways"
      />

      {/* 7 · Reviews */}
      <Slot
        fallback={
          <ReviewMarquee
            action={{ label: 'Read all reviews', href: '/reviews' }}
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
          <StoryFilm
            actions={STORY.actions}
            chapters={STORY.chapters}
            description={STORY.description}
            kicker={STORY.kicker}
            title={STORY.title}
            video={STORY.video}
          />
        }
        label="Home story band"
        snapshotId="home-story"
      />

      {/* 9 · Showrooms */}
      <Slot
        fallback={
          <ShowroomMapBand
            showrooms={SHOWROOM_DETAILS}
            token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          />
        }
        label="Home showrooms"
        snapshotId="home-showrooms"
      />

      {/* 10 · Articles — latest blog posts */}
      <BlogPostCarousel
        action={{ label: 'More articles', href: '/blog' }}
        kicker="Blog"
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
