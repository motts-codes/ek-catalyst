'use client';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import { ProductCarousel, ProductsCarouselSkeleton } from '@/vibes/soul/sections/product-carousel';
import { ProductTabsShell, TabRowArrows } from '@/vibes/soul/sections/product-tabs';

import { useProducts } from '../../utils/use-products';

type Collection = 'best-selling' | 'newest' | 'featured';

interface Tab {
  label: string;
  collection: Collection;
  limit: number;
}

interface Props {
  className: string;
  title: string;
  tabs: Tab[];
  aspectRatio: '5:6' | '3:4' | '1:1';
}

const NO_EXTRA_PRODUCTS: string[] = [];

const DEFAULT_TABS: Tab[] = [
  { label: 'Trending', collection: 'featured', limit: 12 },
  { label: 'New', collection: 'newest', limit: 12 },
  { label: 'Best selling', collection: 'best-selling', limit: 12 },
];

// One panel = one store collection, fetched client-side (same hook as the Products Carousel).
function TabPanel({ tab, aspectRatio }: { tab: Tab; aspectRatio: Props['aspectRatio'] }) {
  const { products, isLoading } = useProducts({
    collection: tab.collection,
    collectionLimit: tab.limit,
    additionalProductIds: NO_EXTRA_PRODUCTS,
  });

  if (isLoading || products == null) {
    return <ProductsCarouselSkeleton density="compact" hideControls />;
  }

  return (
    <ProductCarousel
      aspectRatio={aspectRatio}
      controls={<TabRowArrows />}
      density="compact"
      products={products}
    />
  );
}

export function MSProductTabs({ className, title, tabs, aspectRatio }: Props) {
  const source = tabs.length > 0 ? tabs : DEFAULT_TABS;
  const descriptors = source.map((tab, index) => ({ ...tab, id: `${index}-${tab.collection}` }));

  return (
    <HomeSection className={className} halfPadding tint title={title}>
      <ProductTabsShell
        renderPanel={(tab) => <TabPanel aspectRatio={aspectRatio} tab={tab} />}
        tabs={descriptors}
      />
    </HomeSection>
  );
}
