import { Metadata } from 'next';

import { Slideshow } from '@/vibes/soul/sections/slideshow';
import { locales } from '~/i18n/locales';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

// Pro (Trade) landing page.
//
// This is a lightweight, CODE-RENDERED demo of the Homeowner|Pro switch — a single hero banner so
// the client can see the toggle route to a distinct Pro page immediately, without needing a
// Makeswift page published at "/pro" first. When you're ready for a fully editable Pro page, swap
// this back to `<MakeswiftPage path="/pro" />` and build it visually in Makeswift.
export function generateMetadata(): Metadata {
  return {
    title: 'Pro / Trade Program',
    description:
      'Express Kitchens Pro — trade pricing, dedicated support, and bulk ordering for contractors and designers.',
  };
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

// Pro hero banner — local asset (contractor + loaded truck on red). Served same-origin from
// /public, so it uses Next's default image loader (not the BC CDN loader).
const PRO_HERO_IMAGE = '/images/pro-hero.jpg';

export default function Pro() {
  return (
    <Slideshow
      // Lighten the default ~80%-black text mask so the blue banner shows through, while keeping the
      // bottom dark enough for legible white text. Neutral (cool) tint to match the blue image.
      className="[--slideshow-mask:rgba(10,20,35,0.55)]"
      slides={[
        {
          title: 'Built for the trade',
          // Text stays white (default) — the banner background is already dark red.
          description:
            'Contractor pricing, dedicated project support, and bulk ordering — everything your business needs to move faster on every job.',
          showDescription: true,
          image: { alt: 'Express Kitchens Pro — contractor with a truck loaded with cabinets', src: PRO_HERO_IMAGE },
          showCta: true,
          cta: { label: 'Apply for Pro', href: '#', variant: 'primary' },
        },
      ]}
      // Single slide — no autoplay needed.
      playOnInit={false}
    />
  );
}
