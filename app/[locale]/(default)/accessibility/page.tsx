import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero, RedBox } from '@/vibes/soul/sections/page-kit';
import { submitSupportLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    "We're working toward WCAG 2.2 AA across this site. If something gets in your way, call or text 860-247-1000 or tell us online, and we'll fix it or help you another way.",
};

// Phone is the one contact we can verify (10-digit US check); email stays optional for anyone who
// needs a written channel, which on this form matters.
const FIELDS: Array<Field | Field[]> = [
  [
    { type: 'text', name: 'name', label: 'Your name', required: true },
    { type: 'tel', name: 'phone', label: 'Phone', required: true },
  ],
  [
    { type: 'email', name: 'email', label: 'Email' },
    { type: 'text', name: 'page', label: 'The page or feature' },
  ],
  { type: 'textarea', name: 'message', label: 'What happened', required: true },
];

export default async function Accessibility({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Accessibility', href: '/accessibility' }]} />
      <PageHero
        actions={[{ label: 'Report a barrier', href: '#report', primary: true }]}
        description="You should be able to shop and plan a kitchen here, whatever device, browser or assistive technology you use. We're working toward the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA. If anything gets in your way, tell us and we'll fix it, or help you another way."
        image={{
          src: '/images/pages/accessibility/hero-accessibility-icon.jpg',
          alt: 'A red clay disc with the white accessibility figure, a cursor arrow and a button beside it',
        }}
        imageStyle="plain"
        kicker="Accessibility statement"
        note="Last updated November 2026."
        title="This site should work for everyone"
      />
      {/* Contact details to confirm with EK: the dedicated address (else their main one) and the
          3-business-day reply time. */}
      <CategoryPoints
        points={[
          { icon: 'tag', label: 'accessibility@expresskitchens.com' },
          { icon: 'phone', label: 'Call or text 860-247-1000, any time' },
          { icon: 'clock', label: 'We reply within 3 business days' },
        ]}
      />
      {/* Only claims the build backs up. Re-check keyboard, contrast and motion cards against the
          live build before launch; captions/transcripts and real-text cards were dropped because
          the videos sit on YouTube without transcripts and the offer banners are images. */}
      <CardsRow
        cards={[
          {
            title: 'Text for every image',
            image: {
              src: '/images/pages/accessibility/card-alt-text.webp',
              alt: 'A white picture frame with a swing tag attached, on red',
            },
            description:
              'Product photos, door samples and offer banners have descriptive alt text, so a screen reader describes the cabinet, not the file name.',
          },
          {
            title: 'Works from the keyboard',
            image: {
              src: '/images/pages/accessibility/card-keyboard.webp',
              alt: 'Four white arrow keys, up, left, down and right, on red',
            },
            description:
              'Menus, filters, forms and checkout work with Tab, Enter and the arrow keys, and you can always see where you are.',
          },
          {
            title: 'Readable contrast',
            image: {
              src: '/images/pages/accessibility/card-contrast.webp',
              alt: 'A round disc split into a white half and a black half, on red',
            },
            description: 'Text and buttons are designed to meet WCAG contrast ratios.',
          },
          {
            title: 'Clear structure',
            image: {
              src: '/images/pages/accessibility/card-structure.webp',
              alt: 'A white form with a heading, labeled fields and a button, on red',
            },
            description: 'Headings in order, labeled form fields and clear error messages.',
          },
          {
            title: 'Motion you control',
            image: {
              src: '/images/pages/accessibility/card-motion.webp',
              alt: 'A white pause button, on red',
            },
            description:
              "Slideshows pause when you hover or focus on them, and follow your device's reduced-motion setting.",
          },
          {
            title: 'Zoom without breaking',
            image: {
              src: '/images/pages/accessibility/card-zoom.webp',
              alt: 'A white magnifying glass with a plus sign, on red',
            },
            description: 'The site works at 200% zoom and on a phone without sideways scrolling.',
          },
        ]}
        columns={3}
        imageStyle="plain"
        kicker="What we do"
        numbered
        tint
        title="How the site is built to be usable"
      />
      <HomeSection compact>
        <RedBox
          kicker="Known limitations"
          media={{
            image: {
              src: '/images/pages/accessibility/limitations-checklist-wrench-dark.webp',
              alt: 'A white checklist with two items ticked and one open, a wrench beside it, on black',
            },
            split: '60/40',
          }}
          title="What we're still working on"
        >
          <div className="max-w-xl space-y-4 text-sm leading-relaxed text-white/85 @xl:text-base">
            <p>
              Some parts of the site come from partners: the payment step, the embedded maps and the
              YouTube videos. Each partner's own accessibility statement covers those parts.
            </p>
            <p>
              Our offer banners are images. Each one has full alt text, and the offer details are
              written out in plain text below it.
            </p>
            <p>
              Need a spec sheet, a quote or anything else in another format? Ask us, and we'll send
              it in a format that works for you.
            </p>
          </div>
        </RedBox>
      </HomeSection>
      <LeadFormCard
        action={submitSupportLead}
        description="Tell us which page and what happened. We'll reply within 3 business days."
        fields={FIELDS}
        id="report"
        image={{
          src: '/images/pages/accessibility/form-wcag-checklist.webp',
          alt: 'Hands typing on a laptop beside a printed WCAG 2.2 AA checklist with every box ticked, on a red desk',
        }}
        kicker="Tell us what isn't working"
        submitLabel="Send"
        title="Report a barrier"
      />
    </>
  );
}
