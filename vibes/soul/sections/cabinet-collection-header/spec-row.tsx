'use client';

import { clsx } from 'clsx';
import { ArrowUpRight, CalendarCheck, Download, Phone, Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { animatedUnderlineClassName } from '@/vibes/soul/primitives/animated-underline';
import { Link } from '~/components/link';

export interface SpecLine {
  label: string;
  value: string;
}

export interface BuildPoint {
  lead: string;
  detail: string;
}

// Shared body-copy style for the collection header: the overview paragraph and the specification
// list use the same size, colour and leading (13px on phones, 14px from tablet, 150% line-height).
export const HEADER_COPY_CLASS =
  'prose max-w-none text-[13px] leading-[1.5] text-contrast-500 @xl:text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-[#2162a1] [&_li]:my-1 [&_li]:text-contrast-500 [&_p]:my-2 [&_p]:leading-[1.5] [&_p]:text-contrast-500 [&_ul]:list-disc [&_ul]:pl-5';

// The same copy style at a fixed 12px (no tablet bump) for the dense accordion content — the
// "How it's built" bullets and the specification table.
const COMPACT_COPY_CLASS = HEADER_COPY_CLASS.replace('text-[13px]', 'text-xs').replace(
  ' @xl:text-sm',
  '',
);

// An expandable row (Specifications, Offers): label at the link's 14px size, rotating plus, smooth
// height animation (CSS grid rows 0fr → 1fr), optional element pinned to the row's right.
export function AccordionRow({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="relative border-b border-contrast-100">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        // `.font-heading` forces bold (!important) in globals.css; use the family directly.
        className={clsx(
          'flex w-full cursor-pointer items-center gap-2.5 py-2.5 pr-48 text-left font-[family-name:var(--font-family-heading)] text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2',
          // Open: the title goes medium weight and brand red, so the open row reads as selected.
          open ? 'font-medium text-[var(--button-primary-background,#d90716)]' : 'font-normal',
        )}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Plus
          className={clsx('transition-transform duration-300', open && 'rotate-45')}
          size={16}
          strokeWidth={2}
        />
        {title}
      </button>
      {/* Height animates through grid rows (0fr ↔ 1fr), eased symmetrically so opening is as
          visible as closing; the content fades in a beat behind the height. */}
      <div
        className={clsx(
          'grid transition-[grid-template-rows] [transition-duration:400ms] [transition-timing-function:ease-in-out] motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        id={panelId}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={clsx(
              'pb-4 transition-opacity duration-300 motion-reduce:transition-none',
              open ? 'opacity-100 delay-100' : 'opacity-0',
            )}
          >
            {children}
          </div>
        </div>
      </div>
      {aside != null && <div className="absolute right-0 top-[7px]">{aside}</div>}
    </div>
  );
}

// Specifications (the staff-authored HTML; its own leading "Specifications" heading is hidden)
// with the spec-sheet download pinned right. With no copy, just the link; with neither, nothing.
// "How it's built" — the specifications in the customer's words: a short bold lead and the
// plain-English why, one bullet per part of the cabinet. Sits above Specifications.
export function HowBuiltRow({ points = [] }: { points?: BuildPoint[] }) {
  if (points.length === 0) return null;

  return (
    <AccordionRow title="How it's built">
      <ul className={clsx(COMPACT_COPY_CLASS, 'list-disc space-y-1.5 pl-5')}>
        {points.map((point) => (
          <li key={point.lead}>
            <span className="font-semibold text-foreground">{point.lead}</span>
            {point.detail !== '' && <> {point.detail}</>}
          </li>
        ))}
      </ul>
    </AccordionRow>
  );
}

// The specifications as a two-column table (label, value) when the rows parsed, else the HTML.
function SpecTable({ rows }: { rows: SpecLine[] }) {
  return (
    <table className={clsx(COMPACT_COPY_CLASS, 'w-full border-collapse')}>
      <tbody className="divide-y divide-contrast-100">
        {rows.map((row) => (
          <tr className="align-top" key={row.label}>
            <th
              className="w-[38%] py-1.5 pr-4 text-left font-medium text-contrast-500 @md:w-[30%]"
              scope="row"
            >
              {row.label}
            </th>
            <td className="py-1.5 text-foreground">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SpecRow({
  specifications = '',
  specRows = [],
  specSheetUrl = '',
}: {
  specifications?: string;
  specRows?: SpecLine[];
  specSheetUrl?: string;
}) {
  const specSheetLink = specSheetUrl !== '' && (
    <a
      className="inline-flex min-h-6 items-center gap-1.5 py-1 text-sm font-normal"
      href={specSheetUrl}
      rel="noreferrer"
      target="_blank"
    >
      <Download size={15} strokeWidth={1.75} />
      {/* The breadcrumb's animated red underline on hover. */}
      <span className={animatedUnderlineClassName}>Download spec sheet</span>
    </a>
  );

  if (specifications === '') return specSheetLink || null;

  return (
    <AccordionRow aside={specSheetLink || undefined} title="Specifications">
      {specRows.length > 0 ? (
        <SpecTable rows={specRows} />
      ) : (
        <div
          className={clsx(
            HEADER_COPY_CLASS,
            '[&>h3:first-child]:hidden [&_table]:w-full [&_td]:border [&_td]:border-contrast-100 [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-contrast-100 [&_th]:px-3 [&_th]:py-1.5',
          )}
          dangerouslySetInnerHTML={{ __html: specifications }}
        />
      )}
    </AccordionRow>
  );
}

export interface CollectionOffer {
  text: string;
  /** A substring of `text` picked out in black (the code, the amount). */
  highlight?: string;
  /** Link to the full offer / terms — rendered as a small arrow after the text. */
  href?: string;
}

function Highlighted({ text, highlight }: { text: string; highlight?: string }) {
  const i = highlight ? text.indexOf(highlight) : -1;

  if (!highlight || i < 0) return text;

  return (
    <>
      {text.slice(0, i)}
      <span className="font-medium text-foreground">{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  );
}

// The offers that apply to this collection + program (from the registry in /cabinet-admin →
// Offers). Nothing to show → no row.
export function OffersRow({ offers }: { offers: CollectionOffer[] }) {
  if (offers.length === 0) return null;

  return (
    <AccordionRow title="Offers">
      <div className={HEADER_COPY_CLASS}>
        <ul>
          {offers.map((offer) => (
            <li key={offer.text}>
              <Highlighted highlight={offer.highlight} text={offer.text} />
              {offer.href != null && (
                <Link
                  aria-label={`Offer details: ${offer.text}`}
                  // `!` beats the copy style's blue link colour.
                  className="ml-1 inline-flex translate-y-[2px] !text-contrast-400 transition-[color,transform] duration-200 ease-out hover:scale-125 hover:!text-[var(--button-primary-background,#d90716)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-1 motion-reduce:hover:scale-100"
                  href={offer.href}
                >
                  <ArrowUpRight aria-hidden size={14} strokeWidth={2} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AccordionRow>
  );
}

// "Need help?" under the offers: two pills on the right — a free design consult (warm cream,
// black text) and the showroom line (thin brand-red outline, filling red on hover) — joined by
// "or". The number is a tel: link so a tap dials; on phones the pills drop under the label.
export function HelpRow({
  phone = '860-247-1000',
  consultHref = '/book',
}: {
  phone?: string;
  consultHref?: string;
}) {
  const pill =
    'inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2';

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-contrast-100 py-3 text-sm text-contrast-500">
      <p className="m-0 font-medium text-foreground">Need help?</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className={clsx(pill, 'bg-[#F6EBD6] text-foreground hover:bg-[#efdfc0]')}
          href={consultHref}
        >
          <CalendarCheck size={15} strokeWidth={1.75} />
          Book a free design consult
        </Link>
        <span className="text-xs">or</span>
        <a
          className={clsx(
            pill,
            'border-[0.5px] border-[var(--button-primary-background,#d90716)] text-[var(--button-primary-background,#d90716)] hover:bg-[var(--button-primary-background,#d90716)] hover:text-white',
          )}
          href={`tel:+1${phone.replace(/\D/g, '')}`}
        >
          <Phone size={15} strokeWidth={1.75} />
          Call {phone}
        </a>
      </div>
    </div>
  );
}
