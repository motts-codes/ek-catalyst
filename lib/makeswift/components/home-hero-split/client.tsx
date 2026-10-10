'use client';

import { type HeroCtaColor, HomeHeroSplit } from '@/vibes/soul/sections/home-hero-split';
import { HERO_OFFERS, HERO_SLIDES } from '~/lib/home/home-content';

import { useSectionDefaults } from '../section-defaults';

interface Slide {
  title: string;
  imageSrc?: string;
  imageAlt: string;
  link?: { href?: string; target?: string };
  ctaLabel: string;
  showCta: boolean;
  ctaColor: HeroCtaColor;
}

interface Offer {
  kicker: string;
  headline: string;
  description: string;
  link?: { href?: string; target?: string };
  ctaLabel: string;
  showCta: boolean;
  ctaColor: HeroCtaColor;
}

interface Props {
  className: string;
  slides: Slide[];
  offers: Offer[];
  slideInterval: number;
}

// Empty lists (not edited yet, or freshly dropped) show the page's defaults — or the homeowner
// wireframe content when there is no page context — so the builder never renders an empty hero.
export function MSHomeHeroSplit({ className, slides, offers, slideInterval }: Props) {
  const defaults = useSectionDefaults();

  return (
    <HomeHeroSplit
      className={className}
      offers={
        offers.length > 0
          ? offers.map(({ kicker, headline, description, link, ctaLabel, showCta, ctaColor }) => ({
              kicker,
              headline,
              description,
              href: link?.href ?? '#',
              ctaLabel,
              showCta,
              ctaColor,
            }))
          : (defaults.offers ?? HERO_OFFERS)
      }
      slideInterval={slideInterval * 1000}
      slides={
        slides.length > 0
          ? slides.map(({ title, imageSrc, imageAlt, link, ctaLabel, showCta, ctaColor }) => ({
              title,
              image: imageSrc ? { src: imageSrc, alt: imageAlt } : undefined,
              href: link?.href,
              ctaLabel,
              showCta,
              ctaColor,
            }))
          : (defaults.slides ?? HERO_SLIDES)
      }
    />
  );
}
