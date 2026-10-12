'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import { type CategoryTile } from '@/vibes/soul/sections/category-carousel';
import { type SubcategoryTile } from '@/vibes/soul/sections/category-hero';
import { type HeroOffer, type HeroSlide } from '@/vibes/soul/sections/home-hero-split';
import { type CategoryPoint } from '~/lib/category/category-content';

// Page-level defaults for a directly-editable Makeswift section. The page (server) supplies the
// content to show until marketing edits the component in the builder; the registered component
// (client) reads it here whenever its own lists are still empty. This is how the same "Home /
// Hero Split" component can start with homeowner slides on `/` and trade slides on `/pro`.
export interface SectionDefaults {
  slides?: HeroSlide[];
  offers?: HeroOffer[];
  categories?: CategoryTile[];
  categoriesTitle?: string;
  /** Category row sits right under the hero (minimal top padding). */
  tightTop?: boolean;
  /** Category page header: hero copy from BigCommerce / category-content.ts, points, subcategories. */
  categoryHeader?: CategoryHeaderDefaults;
}

export interface CategoryHeaderDefaults {
  title: string;
  description?: string;
  /** Subcategory page: the shorter, dark-grey hero. */
  compact: boolean;
  /** Top-level hero panel colour: brand red (default) or black. */
  tone?: 'black' | 'red';
  image?: { src: string; alt: string };
  imageLabel?: string;
  ctaLabel: string;
  points: CategoryPoint[];
  fine?: string;
  subTitle: string;
  subcategories: SubcategoryTile[];
}

const SectionDefaultsContext = createContext<SectionDefaults>({});

export const SectionDefaultsProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: SectionDefaults }>) => (
  <SectionDefaultsContext.Provider value={value}>{children}</SectionDefaultsContext.Provider>
);

export const useSectionDefaults = () => useContext(SectionDefaultsContext);
