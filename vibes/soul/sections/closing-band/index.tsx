import { clsx } from 'clsx';
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  ClipboardCheck,
  FileText,
  type LucideIcon,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShoppingBag,
} from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { homeHeadingClassName, HomeSection } from '@/vibes/soul/sections/home-section';

import { ShowroomSelect } from './showroom-select';

interface Action {
  label: string;
  href: string;
  /** The icon before the label; picked from the label when not given. */
  icon?: LucideIcon;
}

interface Props {
  /** Small eyebrow above the heading (white, since the band is red). */
  kicker?: string;
  title?: string;
  description?: string;
  primary?: Action;
  /** Optional second button between the primary and the phone (e.g. "Visit the factory outlet"). */
  secondary?: Action;
  showrooms?: Array<{ name: string; href: string }>;
  /** The call button; null hides it (a band with just the two buttons). */
  phone?: Action | null;
  tint?: boolean;
  className?: string;
}

// The outline buttons as the site's sliding button: white outline, sweeping to a white fill with
// the panel's red text on hover.
const outlineButtonClassName =
  'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:rgb(255_255_255/0.3)] [--button-ghost-text:white] hover:[--button-ghost-border:white] hover:[--button-ghost-text:#9f3632] focus-visible:ring-white focus-visible:ring-offset-[#9f3632]';

// Every button carries an icon. Pages can name one; otherwise it follows the label: a phone for
// calls, a calendar for bookings, a pin for showrooms, and so on.
function iconFor({ label, href, icon }: Action): LucideIcon {
  if (icon) return icon;

  const text = label.toLowerCase();

  if (href.startsWith('tel:') || text.startsWith('call')) return Phone;
  if (/book|consult|design|appointment/.test(text)) return CalendarDays;
  if (/showroom|visit|outlet|find/.test(text)) return MapPin;
  if (/measurement|send/.test(text)) return Send;
  if (/message|talk|contact/.test(text)) return MessageSquare;
  if (/price|cost|estimate/.test(text)) return Calculator;
  if (text.includes('claim')) return ClipboardCheck;
  if (/warranty|read|guide/.test(text)) return FileText;
  if (/shop|browse|cabinet|clearance/.test(text)) return ShoppingBag;

  return ArrowRight;
}

function ActionLabel({ action }: { action: Action }) {
  const Icon = iconFor(action);

  return (
    <>
      <Icon aria-hidden size={16} strokeWidth={2} />
      {action.label.replace(/\s*↗$/, '')}
    </>
  );
}

// The label span inside the button lays out the icon and text in a row.
const withIconClassName = '[&>span]:inline-flex [&>span]:items-center [&>span]:gap-2';

// The last ask on a page — "Ready to design your kitchen?" — as a dark panel with three ways to
// say yes at equal weight: book the consult, visit a showroom (dropdown), or call.
export function ClosingBand({
  kicker,
  title = 'What would your kitchen actually cost?',
  description = 'Got your number? The next step is a person. A designer prices it with you on a video call, or you can see the cabinets up close at one of our six Connecticut showrooms. Either way it is free, and you leave with an itemized quote.',
  primary = { label: 'Free design consult', href: '#' },
  secondary,
  showrooms = [],
  phone = { label: 'Call 860-247-1000', href: 'tel:+18602471000' },
  tint = false,
  className,
}: Props) {
  return (
    // Extra bottom padding so the space to the footer's first content matches the space above
    // (the previous section's bottom padding plus this band's top padding).
    <HomeSection className={clsx('pb-10 lg:pb-14', className)} tint={tint}>
      {/* Deep brand red (#9F3632): white text is 6.9:1 on it. The primary button is black here,
          since the brand-red button would sit at 1.3:1 against this panel. */}
      <div className="relative overflow-hidden rounded-3xl bg-[#9f3632] px-6 py-12 text-center text-white @xl:px-12 @xl:py-16 @4xl:py-20">
        {/* Soft lighter glow, top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          {Boolean(kicker) && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/85">
              {kicker}
            </p>
          )}
          <h2 className={homeHeadingClassName}>{title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/85 @xl:text-base">{description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {/* The site's sliding button: black, sweeping to white with black text on hover. */}
            <ButtonLink
              className={clsx(
                'border-foreground bg-foreground text-white after:!bg-white hover:!text-foreground focus-visible:ring-white focus-visible:ring-offset-[#9f3632] [&>span]:mix-blend-normal',
                withIconClassName,
              )}
              href={primary.href}
              shape="pill"
              size="small"
              variant="secondary"
            >
              <ActionLabel action={primary} />
            </ButtonLink>
            {secondary && (
              <ButtonLink
                className={clsx(outlineButtonClassName, withIconClassName)}
                href={secondary.href}
                shape="pill"
                size="small"
                variant="ghost"
              >
                <ActionLabel action={secondary} />
              </ButtonLink>
            )}
            {showrooms.length > 0 && <ShowroomSelect showrooms={showrooms} />}
            {phone && (
              <ButtonLink
                className={clsx(outlineButtonClassName, withIconClassName)}
                href={phone.href}
                shape="pill"
                size="small"
                variant="ghost"
              >
                <ActionLabel action={phone} />
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
