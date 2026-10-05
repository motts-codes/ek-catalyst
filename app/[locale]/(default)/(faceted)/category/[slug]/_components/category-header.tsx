import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import {
  CategoryHero,
  CategoryPoints,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DEFAULT_CATEGORY_CONTENT, getCategoryContent } from '~/lib/category/category-content';
import { FREE_DESIGN_HREF } from '~/lib/home/home-content';

interface CategoryImage {
  url: string;
  altText: string;
}

interface Props {
  category: {
    name: string;
    path: string;
    description: string;
    defaultImage: CategoryImage | null;
  };
  subcategories?: Array<{ name: string; path: string; image: CategoryImage | null }>;
}

const toImage = (image: CategoryImage | null, fallbackAlt: string) =>
  image ? { src: image.url, alt: image.altText || fallbackAlt } : undefined;

// The BigCommerce description is HTML; the hero wants one plain paragraph.
const toPlainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

// Category page header: name + description on the red panel with the category image beside it,
// then the points row and the subcategories as tiles. Copy can be overridden per category in
// lib/category/category-content.ts; otherwise it is the BigCommerce name and description.
export function CategoryHeader({ category, subcategories = [] }: Props) {
  const content = getCategoryContent(category.path);
  const description = content.lede ?? (toPlainText(category.description) || undefined);

  return (
    <>
      <CategoryHero
        actions={[{ label: `Shop all ${category.name.toLowerCase()}`, href: '#products' }]}
        description={description}
        image={toImage(category.defaultImage, category.name)}
        imageLabel={content.imageLabel}
        title={content.heading ?? category.name}
      />
      <CategoryPoints
        fine={'fine' in content ? content.fine : DEFAULT_CATEGORY_CONTENT.fine}
        points={content.points ?? DEFAULT_CATEGORY_CONTENT.points}
      />
      <SubcategoryTiles
        items={subcategories.map((child) => ({
          name: child.name,
          href: child.path,
          image: toImage(child.image, child.name),
        }))}
        title={content.subTitle ?? DEFAULT_CATEGORY_CONTENT.subTitle}
      />
    </>
  );
}

// Breadcrumb above the header. Matches the PDP treatment: 10px, light grey.
export function CategoryBreadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  if (breadcrumbs.length < 2) return null;

  return (
    <div className="bg-white @container">
      <div className="mx-auto max-w-screen-2xl px-4 pt-[15px] @xl:px-6 @4xl:px-8">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          className="[&_a]:!text-contrast-300 [&_ol]:!text-[10px] [&_span]:!text-contrast-300 [&_svg]:!text-contrast-300"
        />
      </div>
    </div>
  );
}

// Last band on a cabinet collection page: the exit for people who still want a human.
export function CollectionConsult({ name, show }: { name: string; show: boolean }) {
  if (!show) return null;

  return (
    <ClosingBand
      description={`A designer lays out your room in ${name}, prices it both ways, and tells you honestly if another collection suits it better.`}
      primary={{ label: 'Book a design consult', href: FREE_DESIGN_HREF }}
      title={`Not sure ${name} is the one?`}
    />
  );
}
