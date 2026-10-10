import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FormCard, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { submitSupportLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'Express Kitchens aims to meet WCAG 2.2 AA across this site and to fix anything that falls short quickly when it is reported.',
};

const FIELDS: Field[] = [
  { type: 'text', name: 'name', label: 'Your name', required: true },
  { type: 'text', name: 'contact', label: 'Email or phone', required: true },
  { type: 'text', name: 'page', label: 'The page or feature' },
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
        description="This site should work for you whatever device, browser or assistive technology you use. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA across every page, we check it with automated tools and real screen readers, and when something falls short we'd like to hear about it so we can fix it quickly. Updated [date], reviewed every six months."
        kicker="Accessibility statement"
        textOnly
        title="This site should work for everyone"
      />
      <CategoryPoints
        fine="A dedicated address, monitored. (To confirm.)"
        points={[
          { icon: 'tag', label: 'accessibility@expresskitchens.com' },
          { icon: 'phone', label: 'Call or text 860-247-1000' },
          { icon: 'clock', label: 'We respond within 3 business days' },
        ]}
      />
      <CardsRow
        cards={[
          {
            title: 'Text for every image',
            description:
              'Product photos, door samples and diagrams carry meaningful alternative text, so a screen reader describes the cabinet, not the file name.',
          },
          {
            title: 'Works from the keyboard',
            description:
              'Menus, filters, forms and checkout can all be used with Tab, Enter and the arrow keys, and focus is always visible.',
          },
          {
            title: 'Readable contrast',
            description:
              'Text and controls meet the WCAG contrast ratios, including price bars, badges and the footer.',
          },
          {
            title: 'Proper structure',
            description:
              'One main heading per page, headings in order, landmarks for navigation and content, and labelled form fields with clear error messages.',
          },
          {
            title: "No motion you can't stop",
            description:
              "Slideshows and the review wall pause on hover and focus, and respect your system's reduced-motion setting.",
          },
          {
            title: 'Resizable text',
            description: 'The site works at 200% zoom and on a phone without horizontal scrolling.',
          },
          {
            title: 'Captions and transcripts',
            description:
              'Videos in the library carry captions, and the factory film has a transcript.',
          },
          {
            title: 'Real text, not pictures of text',
            description:
              'Comparison tables, prices and lists are text, so they can be read aloud, searched and translated.',
          },
        ]}
        columns={4}
        hideImages
        kicker="What we do"
        tint
        title="How the site is built to be usable"
      />
      <Prose
        body={[
          'The site relies on HTML, WAI-ARIA, CSS and JavaScript, and is tested with current versions of Chrome, Safari, Firefox and Edge, and with VoiceOver on Mac and iOS, NVDA on Windows and TalkBack on Android.',
          'Some content comes from partners — the financing application, the map embeds and the payment step — and is covered by their own accessibility statements. Older PDF spec sheets are being replaced with tagged versions; if you need one sooner, ask us and we will send the information in another format.',
        ]}
        kicker="Technology and known limitations"
        title="What we test with, and what we're still fixing"
      />
      <HomeSection
        description="If any part of the site is hard to use, tell us which page and what happened. We reply within three business days and fix what we can straight away. You can also visit or call any showroom; everything on the site can be done in person or over the phone."
        id="report"
        kicker="Tell us what isn't working"
        tint
        title="Report a barrier"
      >
        <FormCard>
          <DynamicFormSection action={submitSupportLead} fields={FIELDS} submitLabel="Send" />
        </FormCard>
      </HomeSection>
    </>
  );
}
