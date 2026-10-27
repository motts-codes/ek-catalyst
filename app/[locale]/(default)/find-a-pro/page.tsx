import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Find an Installer',
  description:
    "Installation isn't included on anything we sell. Here's how to find a good installer, what to ask them, and how to get your kitchen ready.",
};

const DIRECTORY_HREF =
  'https://www.contractors.com/g/contractor-search/?category=Additions+and+Remodels&subcategory=Remodel%20-%20Multiple%20Rooms';

export default async function FindAPro({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Find a pro', href: '/find-a-pro' }]} />
      <PageHero
        actions={[
          { label: 'Search installers near you ↗', href: DIRECTORY_HREF, primary: true },
          { label: 'Installation prep videos', href: '/resources/how-to-videos#installation-prep' },
        ]}
        description="Installation isn't included on anything we sell: we make the cabinets, deliver them or hand them to you at the outlet, and you or your installer fit them. If you've just discovered that and felt a flicker of worry, this page is for you. Finding a good installer is a solved problem, and here's how to do it."
        image={{
          src: '/images/pages/find-a-pro/installer-levelling.jpg',
          alt: 'An installer levelling a white shaker base cabinet',
        }}
        imageLabel="An installer levelling a base cabinet"
        kicker="Find a pro"
        title="We don't install. Here's how to get it done right."
      />
      <CardsRow
        cards={[
          {
            title: 'Have they hung framed (Star) boxes before?',
            description:
              'Framed and frameless cabinets install differently. Ask which lines they know.',
          },
          {
            title: 'Do they scribe fillers and end panels?',
            description:
              "Walls aren't straight. A good installer scribes the filler to the wall rather than leaving a gap.",
          },
          {
            title: 'Do they level from the high point?',
            description: 'The right way to start a run. If they look puzzled, keep looking.',
          },
          {
            title: "What's included in the price?",
            description:
              'Removal of the old kitchen, disposal, plumbing and electrical reconnection, and hardware fitting are often extras. Ask up front.',
          },
        ]}
        columns={4}
        hideImages
        kicker="What to ask an installer"
        tint
        title="Four questions that sort the good ones"
      />
      <Prose
        actions={[
          { label: 'Installation prep checklist', href: '/resources/cabinet-care' },
          {
            label: 'Watch: what a good install looks like',
            href: '/resources/how-to-videos#installation-prep',
          },
        ]}
        body={[
          'Before the installer arrives, unbox the cabinets with two people, check every piece against the packing list, and let them sit in the room for a day or two to acclimatise. Keep the boxes until everything is on the wall. The cabinet care page has the full before-and-after checklist, and the video library shows levelling, hanging wall cabinets and scribing, so you know what good work looks like whoever does it.',
        ]}
        kicker="Prep guide"
        title="Get the room ready"
      />
      <Prose
        actions={[{ label: 'Join the Pro Program', href: '/pro-program', primary: true }]}
        body={[
          'Pro Program members can be listed here free. We pass on the inquiry and you deal with the homeowner direct. (Program decision pending: a verified installer directory, or a referral partner.)',
        ]}
        kicker="Are you an installer?"
        tint
        title="Get listed"
      />
      <ClosingBand
        description="A Project Manager plans the kitchen with you and can point you to installers who work with our cabinets every week."
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        title="Rather talk it through?"
      />
    </>
  );
}
