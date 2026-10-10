import { type Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
import {
  CategoryHero,
  CategoryPoints,
  type SubcategoryTile,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { type CategoryContent, DEFAULT_CATEGORY_CONTENT } from '~/lib/category/category-content';

interface Props {
  breadcrumbs: Breadcrumb[];
  title: string;
  /** The same entry the BigCommerce category template reads (lib/category/category-content.ts). */
  content: CategoryContent;
  actions?: Array<{ label: string; href: string }>;
  /** Kicker / title / body for the short note under the tiles. */
  note: { kicker: string; title: string; body: string };
  closing: {
    primary: { label: string; href: string };
    showrooms: Array<{ name: string; href: string }>;
  };
}

// A shop landing for a category whose products aren't in the catalog yet: the same red hero,
// promise row and subcategory tiles as a BigCommerce category page, from the same content entry,
// so nothing changes for the visitor when the real category takes over the URL (and the product
// grid appears beneath).
export function ShopLanding({ breadcrumbs, title, content, actions, note, closing }: Props) {
  const tiles: SubcategoryTile[] = (content.subcategories ?? []).map((tile) => ({
    name: tile.name,
    href: tile.fallbackHref,
    image: tile.image,
  }));

  return (
    <>
      <PageBreadcrumbs breadcrumbs={breadcrumbs} />
      <CategoryHero
        actions={actions}
        description={content.lede}
        imageLabel={content.imageLabel}
        title={content.heading ?? title}
      />
      <CategoryPoints
        fine={'fine' in content ? content.fine : DEFAULT_CATEGORY_CONTENT.fine}
        points={content.points ?? DEFAULT_CATEGORY_CONTENT.points}
      />
      <SubcategoryTiles
        items={tiles}
        title={content.subTitle ?? DEFAULT_CATEGORY_CONTENT.subTitle}
      />
      <HomeSection compact kicker={note.kicker} tint title={note.title}>
        <p className="max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
          {note.body}
        </p>
      </HomeSection>
      <ClosingBand primary={closing.primary} showrooms={closing.showrooms} />
    </>
  );
}
