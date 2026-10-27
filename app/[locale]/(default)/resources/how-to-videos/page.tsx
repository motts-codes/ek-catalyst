import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { VideoGrid } from '@/vibes/soul/sections/page-kit/media';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import type { Video } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'How-To Videos',
  description:
    'Watch our cabinets go together, step by step: base cabinets, lazy susans, corner walls, tall utility cabinets and roll-out trays. Filmed by Express Kitchens.',
};

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@expresskitchensct';
const PLAYLIST_HREF =
  'https://www.youtube.com/watch?v=tYEPnjp9-w8&list=PLvW4V4-1I9cHk3a7Szu-CCISzmlaHmgvb';

// EK's "Installation Guide" playlist (Oct 2026), the only how-to films on the channel so far.
// Titles are tidied from the YouTube ones; ids are the playlist's.
const INSTALLATION_VIDEOS: Video[] = [
  { youtubeId: 'oRZQGo_oiXQ', title: 'How to assemble a base cabinet', meta: 'Assembly' },
  { youtubeId: 'j1ei-ATu1K8', title: 'How to assemble a lazy susan', meta: 'Assembly' },
  {
    youtubeId: 'o71kDMds1bc',
    title: 'How to assemble a diagonal corner wall cabinet',
    meta: 'Assembly',
  },
  { youtubeId: 'crG_DNcWGwo', title: 'How to assemble tall utility cabinets', meta: 'Assembly' },
  { youtubeId: 'B7GI2iuq18E', title: 'Blind base cabinets', meta: 'Assembly' },
  {
    youtubeId: 'tYEPnjp9-w8',
    title: 'How to install roll-out trays (Star cabinetry)',
    meta: 'Accessories',
  },
];

// The video library: one playlist for now, each film opening in a dialog on the page.
export default async function HowToVideos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'How-to videos', href: '/resources/how-to-videos' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Watch the videos', href: '#videos', primary: true },
          { label: 'Our YouTube channel ↗', href: YOUTUBE_CHANNEL, style: 'outline' },
        ]}
        description="Short films that show you rather than tell you: how a base cabinet goes together, how a lazy susan and a corner wall cabinet fit, how a tall utility cabinet stands up, and how roll-out trays go in. Watch one before you open the box and the build goes faster."
        image={{
          src: '/images/pages/how-to/hands-assembling.jpg',
          alt: 'Hands assembling a cabinet box on a workbench',
        }}
        kicker="Video library"
        title="Watch it done, then do it yourself"
      />
      <div id="videos" />
      <VideoGrid
        action={{ label: 'Open the playlist on YouTube ↗', href: PLAYLIST_HREF }}
        columns={3}
        description="Our installation guide, one cabinet at a time. Tap a film to watch it here."
        kicker="Installation guide"
        tint
        title="Build your ready-to-assemble cabinets"
        videos={INSTALLATION_VIDEOS}
      />
      <Prose
        actions={[{ label: 'Subscribe on YouTube ↗', href: YOUTUBE_CHANNEL }]}
        body={[
          "We're filming more: measuring your kitchen, what happens at a design consult, and what a good installation looks like. New films land on our YouTube channel first.",
        ]}
        kicker="More to come"
        title="New films as we make them"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
