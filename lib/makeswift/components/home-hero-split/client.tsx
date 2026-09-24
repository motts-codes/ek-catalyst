'use client';

import { type HeroCtaColor, HomeHeroSplit } from '@/vibes/soul/sections/home-hero-split';
import { HERO_OFFERS, HERO_SLIDES } from '~/lib/home/home-content';

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
  offerInterval: number;
}

// Empty lists (a freshly dropped component) show the wireframe defaults so the builder never
// renders an empty hero.
export function MSHomeHeroSplit({
  className,
  slides,
  offers,
  slideInterval,
  offerInterval,
}: Props) {
  return (
    <HomeHeroSplit
      className={className}
      offerInterval={offerInterval * 1000}
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
          : HERO_OFFERS
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
          : HERO_SLIDES
      }
    />
  );
}
