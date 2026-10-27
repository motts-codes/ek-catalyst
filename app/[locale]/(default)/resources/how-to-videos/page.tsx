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
    'Watch our cabinets and closet units go together, step by step: base cabinets, lazy susans, corner walls, tall utility cabinets, roll-out trays and four closet units. Filmed by Express Kitchens.',
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

// EK's closet assembly films (Oct 2026), by unit.
const CLOSET_VIDEOS: Video[] = [
  { youtubeId: 'MwfIgOi_SZc', title: 'Double hanging unit', meta: 'DHW24, DHW30, DHW36' },
  { youtubeId: 'mDC1TannblY', title: 'Tall hanging unit', meta: 'THW18, THW24, THW30, THW36' },
  { youtubeId: '8I0a2RgOXbw', title: 'Low hanging unit', meta: 'LHW18, LHW24, LHW30, LHW36' },
  { youtubeId: 'vch7U07131c', title: 'Tower unit', meta: 'TW18, TW24, TW30' },
];

// The video library: cabinets, then closets, each film opening in a dialog on the page.
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
        description="Short films that show you rather than tell you: how a base cabinet goes together, how a lazy susan and a corner wall cabinet fit, how a tall utility cabinet stands up, how roll-out trays go in, and how each closet unit is built. Watch one before you open the box and the build goes faster."
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
      <div id="closets" />
      <VideoGrid
        columns={2}
        description="The four closet units, each built on camera from the flat pack. The codes match your box label."
        kicker="Closets"
        title="Build your closet units"
        videos={CLOSET_VIDEOS}
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
