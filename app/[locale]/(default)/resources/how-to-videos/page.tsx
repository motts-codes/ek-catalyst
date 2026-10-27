import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { VideoGrid } from '@/vibes/soul/sections/page-kit/media';
import { Link } from '~/components/link';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'How-To Videos',
  description:
    'Watch a cabinet being built, learn to assemble yours, measure your kitchen and see what to expect from design to delivery. Filmed in our own factory and showrooms.',
};

const SECTIONS = [
  'Assembly',
  'Measuring',
  'Design help',
  'Installation prep',
  'Inside the factory',
  'Closets & windows',
  'Care',
];
const CODES = [
  'B09',
  'B12',
  'B15',
  'B18',
  'B24',
  'B30',
  'B36',
  'SB36',
  'DB24-3',
  'W1230',
  'W3030',
  'W3630',
];

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
          { label: 'Assembly videos', href: '#assembly', primary: true },
          { label: 'Our YouTube channel ↗', href: '#' },
        ]}
        description="Short films, made in our own factory and showrooms, that show you rather than tell you: how a cabinet goes together, how to measure your kitchen in two minutes, what happens at a design consult, and what a good installation looks like. Pick a topic below, or jump straight to the video for your exact cabinet."
        image={{
          src: '/images/pages/how-to/hands-assembling.jpg',
          alt: 'Hands assembling a cabinet box on a workbench',
        }}
        imageLabel="Hands assembling a cabinet on a workbench"
        kicker="Video library"
        title="Watch it done, then do it yourself"
      />
      <HomeSection compact tint>
        <nav aria-label="Video topics">
          <ul className="flex flex-wrap gap-2.5">
            {SECTIONS.map((s) => (
              <li key={s}>
                <Link
                  className="inline-flex items-center rounded-full border border-contrast-200 bg-white px-4 py-2 text-sm font-medium text-contrast-500 transition-colors hover:border-foreground hover:text-foreground"
                  href={`#${s.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </HomeSection>
      <VideoGrid
        kicker="Start here"
        title="The three most-watched"
        videos={[
          {
            title: 'How to assemble a base cabinet — Star, framed',
            meta: 'Assembly',
            duration: '4:10',
          },
          { title: 'Measure your kitchen in 2 minutes', meta: 'Measuring', duration: '2:05' },
          { title: 'What happens at a free design consult', meta: 'Design help', duration: '3:20' },
        ]}
      />
      <div id="assembly" />
      <VideoGrid
        columns={5}
        description="Every cabinet type, step by step. The box goes together differently on each line, so pick yours first: Star is framed, Euro Max is frameless."
        kicker="Assembly"
        tint
        title="Build your ready-to-assemble cabinets"
        videos={[
          { title: 'Base cabinet', duration: '5:30' },
          { title: 'Wall cabinet', duration: '4:15' },
          { title: 'Drawer base', duration: '6:40' },
          { title: 'Sink base', duration: '5:05' },
          { title: 'Tall / pantry', duration: '7:20' },
          { title: 'Corner base — lazy susan', duration: '6:10' },
          { title: 'Blind corner base', duration: '5:45' },
          { title: 'Diagonal wall', duration: '4:50' },
          { title: 'Over-fridge wall', duration: '3:30' },
          { title: 'Drawer boxes & glides', duration: '4:00' },
        ]}
      />
      <HomeSection
        compact
        description="Every cabinet code has its own film. Find the code on your order or the box label, e.g. B30, W3030, SB36."
        title="Find the video for your exact cabinet"
      >
        <ul className="flex flex-wrap gap-2">
          {CODES.map((c) => (
            <li key={c}>
              <Link
                className="inline-flex items-center gap-1.5 rounded-full border border-contrast-200 bg-white px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-foreground"
                href="#"
              >
                ▶ {c}
              </Link>
            </li>
          ))}
        </ul>
      </HomeSection>
      <div id="measuring" />
      <VideoGrid
        action={{ label: 'Measuring guide', href: '/resources/measuring-guide' }}
        columns={2}
        description="Watch the quick one first. If your room has corners, soffits or an island, the detailed version walks every wall. Then use the printable guide and send us the numbers."
        kicker="Measuring"
        tint
        title="Measure your kitchen"
        videos={[
          {
            title: 'Quick measure — 2 minutes',
            meta: 'Enough to start a design',
            duration: '2:05',
          },
          {
            title: 'Detailed measure — every wall',
            meta: 'Corners, soffits, islands, appliances',
            duration: '9:40',
          },
        ]}
      />
      <div id="design-help" />
      <VideoGrid
        action={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        columns={2}
        description="See how a Project Manager turns your measurements into a 3D design and an itemized price, whether it's your first kitchen or, if you're a contractor, your hundredth."
        kicker="Design help"
        title="From sketch to plan"
        videos={[
          {
            title: 'What happens at a free design consult',
            meta: 'At home, in a showroom or on a call',
            duration: '3:20',
          },
          {
            title: 'Reading your 3D design and quote',
            meta: 'Overhead, perspective, the cabinet list',
            duration: '4:05',
          },
        ]}
      />
      <div id="installation-prep" />
      <VideoGrid
        action={{ label: 'Find an installer ↗', href: '#' }}
        description="We don't install, but we can show you what a good install looks like, so you know what to ask for whether you're doing it yourself or hiring someone."
        kicker="Installation prep"
        tint
        title="Before the installer arrives"
        videos={[
          { title: 'Levelling from the high point', duration: '5:15' },
          { title: 'Hanging wall cabinets', duration: '6:30' },
          { title: 'Scribing fillers and end panels', duration: '4:45' },
        ]}
      />
      <div id="inside-the-factory" />
      <VideoGrid
        action={{ label: 'Why Express Kitchens', href: '/why-express-kitchens' }}
        description="Short films from the line: what the box is made of, how the finish goes on, and how ours compares with what the big-box stores sell."
        kicker="Inside the factory"
        title="Quality you can see"
        videos={[
          {
            title: 'How a cabinet is made',
            meta: 'Cut, drilled, finished in Bristol',
            duration: '3:50',
          },
          {
            title: 'The all-plywood box, explained',
            meta: 'Why no particle board',
            duration: '2:40',
          },
          {
            title: 'Our cabinets vs big-box',
            meta: 'Same kitchen, side by side',
            duration: '4:20',
          },
        ]}
      />
      <div id="closets-windows" />
      <VideoGrid
        columns={4}
        kicker="Closets & windows"
        tint
        title="Beyond the kitchen"
        videos={[
          { title: 'Build a reach-in closet from six parts', meta: 'Closets', duration: '7:10' },
          { title: 'Fitting closet drawers and rods', meta: 'Closets', duration: '4:30' },
          {
            title: 'Measuring united inches for the $179.99 window',
            meta: 'Windows',
            duration: '1:50',
          },
          { title: 'Replacing a double-hung window', meta: 'Windows', duration: '8:20' },
        ]}
      />
      <div id="care" />
      <VideoGrid
        action={{ label: 'Cabinet care guide', href: '/resources/cabinet-care' }}
        description="Cleaning painted and stained doors, adjusting hinges and glides, and touching up a chip."
        kicker="Care"
        title="Keep it looking new"
        videos={[
          { title: 'Cleaning painted doors', duration: '2:15' },
          { title: 'Adjusting a soft-close hinge', duration: '3:00' },
          { title: 'Touching up a chip', duration: '2:50' },
        ]}
      />
      <Prose
        body={[
          'The videos above are placeholders until the films are produced; each tile is ready to take a YouTube link.',
        ]}
        kicker="Note"
        tint
        title="Films to come"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
