import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DEFAULT_CATEGORY_CONTENT, getCategoryContent } from '~/lib/category/category-content';
import { FREE_DESIGN_HREF } from '~/lib/home/home-content';
import { type CategoryHeaderDefaults } from '~/lib/makeswift/components/section-defaults';

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

// Defaults for the editable category header (Makeswift "Category / Header"): name, description
// and image from BigCommerce, overridable per category in lib/category/category-content.ts.
export function getCategoryHeaderDefaults({
  category,
  subcategories = [],
}: Props): CategoryHeaderDefaults {
  const content = getCategoryContent(category.path);

  return {
    title: content.heading ?? category.name,
    description: content.lede ?? (toPlainText(category.description) || undefined),
    image: toImage(category.defaultImage, category.name),
    imageLabel: content.imageLabel,
    ctaLabel: `Shop all ${category.name.toLowerCase()}`,
    points: content.points ?? DEFAULT_CATEGORY_CONTENT.points,
    fine: 'fine' in content ? content.fine : DEFAULT_CATEGORY_CONTENT.fine,
    subTitle: content.subTitle ?? DEFAULT_CATEGORY_CONTENT.subTitle,
    subcategories: content.subcategories
      ? content.subcategories.map((tile) => ({
          name: tile.name,
          href: findChild(subcategories, tile.name)?.path ?? tile.fallbackHref,
          image: tile.image,
        }))
      : subcategories.map((child) => ({
          name: child.name,
          href: child.path,
          image: toImage(child.image, child.name),
        })),
  };
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, '');

// The BigCommerce child category whose name matches an overridden tile ("Fridges & Freezers").
function findChild(children: NonNullable<Props['subcategories']>, name: string) {
  return children.find((child) => slug(child.name) === slug(name));
}

// Breadcrumb above the header. Small and grey like the PDP's, but at a grey/size that passes AA.
export function CategoryBreadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  if (breadcrumbs.length < 2) return null;

  return (
    <div className="bg-white @container">
      <div className="mx-auto max-w-screen-2xl px-6 pt-[15px] @xl:px-9 @4xl:px-14">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          className="[&_a]:!text-contrast-400 [&_ol]:!text-[11px] [&_span]:!text-contrast-400 [&_svg]:!text-contrast-400"
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
