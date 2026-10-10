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

type Point = Parameters<typeof CategoryPoints>[0]['points'][number];

interface Props {
  breadcrumbs: Breadcrumb[];
  title: string;
  description: string;
  imageLabel: string;
  actions?: Array<{ label: string; href: string }>;
  points: Point[];
  pointsFine?: string;
  tilesTitle: string;
  tiles: SubcategoryTile[];
  /** Kicker / title / body for the short note under the tiles. */
  note: { kicker: string; title: string; body: string };
  closing: {
    primary: { label: string; href: string };
    showrooms: Array<{ name: string; href: string }>;
  };
}

// A shop landing for a category whose products aren't in the catalog yet: the same red hero,
// promise row and subcategory tiles as a BigCommerce category page, so nothing changes for the
// visitor when the real category takes over the URL.
export function ShopLanding({
  breadcrumbs,
  title,
  description,
  imageLabel,
  actions,
  points,
  pointsFine,
  tilesTitle,
  tiles,
  note,
  closing,
}: Props) {
  return (
    <>
      <PageBreadcrumbs breadcrumbs={breadcrumbs} />
      <CategoryHero
        actions={actions}
        description={description}
        imageLabel={imageLabel}
        title={title}
      />
      <CategoryPoints fine={pointsFine} points={points} />
      <SubcategoryTiles items={tiles} title={tilesTitle} />
      <HomeSection compact kicker={note.kicker} tint title={note.title}>
        <p className="max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
          {note.body}
        </p>
      </HomeSection>
      <ClosingBand primary={closing.primary} showrooms={closing.showrooms} />
    </>
  );
}
