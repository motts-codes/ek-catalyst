import { SubmissionResult } from '@conform-to/react';
import { clsx } from 'clsx';
import { Phone } from 'lucide-react';
import { ReactNode } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { InlineEmailForm } from '@/vibes/soul/primitives/inline-email-form';
import { Logo } from '@/vibes/soul/primitives/logo';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { ShowroomSelect } from '@/vibes/soul/sections/closing-band/showroom-select';
import { Link } from '~/components/link';

interface Image {
  src: string;
  alt: string;
}

interface FooterLink {
  /** Omit to render the label as a sub-heading inside the column (e.g. "Offers"). */
  href?: string;
  label: string;
  target?: string;
}

export interface Section {
  title?: string;
  links: FooterLink[];
}

interface SocialMediaLink {
  href: string;
  icon: ReactNode;
}

interface ContactInformation {
  address?: string;
  phone?: string;
}

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface NewsletterBand {
  title: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
  action: Action<{ lastResult: SubmissionResult | null; successMessage?: string }, FormData>;
}

export interface ContactPanel {
  title: string;
  phone: { label: string; href: string };
  hoursTitle?: string;
  hours?: string[];
  showroomsTitle?: string;
  showrooms?: Array<{ name: string; href: string }>;
}

export interface FooterProps {
  logo: Streamable<string | Image | null>;
  sections: Streamable<Section[]>;
  copyright?: Streamable<string>;
  /** Legacy address/phone block — superseded by `contactPanel` when both are given. */
  contactInformation?: Streamable<ContactInformation>;
  paymentIcons?: Streamable<ReactNode[]>;
  socialMediaLinks?: Streamable<SocialMediaLink[]>;
  contactTitle?: string;
  className?: string;
  logoHref?: string;
  logoLabel?: string;
  logoWidth?: number;
  logoHeight?: number;
  /** "Subscribe to our newsletter" band above the footer. */
  newsletter?: NewsletterBand;
  /** One-line brand blurb under the logo. */
  description?: string;
  /** Call/text · working hours · find-a-showroom column (last column of the link grid). */
  contactPanel?: ContactPanel;
  /** Privacy · Terms · Accessibility, shown after the copyright in the legal strip. */
  legalLinks?: FooterLink[];
}

const footerLinkClassName =
  'block rounded-lg py-1.5 text-sm text-[var(--footer-link,hsl(var(--contrast-500)))] ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 hover:text-[var(--footer-link-hover,var(--button-primary-background,#d90716))] focus-visible:outline-0 focus-visible:ring-2';

// Site footer, per the wireframe: newsletter band → brand row (logo, blurb, social) → link columns
// + the contact column → legal strip with payment badges.
//
// Supports these CSS variables (defaults shown):
//   --footer-focus: hsl(var(--primary)); --footer-background: hsl(var(--background));
//   --footer-border-top: hsl(var(--contrast-100)); --footer-social-icon: hsl(var(--contrast-400));
//   --footer-social-icon-hover: hsl(var(--foreground)); --footer-section-title: hsl(var(--foreground));
//   --footer-link: hsl(var(--contrast-500)); --footer-link-hover: the brand red (as the main nav);
//   --footer-copyright: hsl(var(--contrast-500));
export const Footer = ({
  logo,
  sections: streamableSections,
  contactTitle = 'Contact Us',
  contactInformation: streamableContactInformation,
  paymentIcons: streamablePaymentIcons,
  socialMediaLinks: streamableSocialMediaLinks,
  copyright: streamableCopyright,
  className,
  logoHref = '#',
  logoLabel = 'Home',
  logoWidth = 200,
  logoHeight = 40,
  newsletter,
  description,
  contactPanel,
  legalLinks = [],
}: FooterProps) => {
  return (
    <footer
      className={clsx(
        'group/footer border-t border-t-[var(--footer-border-top,hsl(var(--contrast-100)))] bg-[var(--footer-background,hsl(var(--background)))] @container',
        className,
      )}
    >
      {/* Newsletter band */}
      {newsletter && (
        <div className="bg-foreground text-white">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-5 px-6 py-8 @xl:px-9 @3xl:flex-row @3xl:items-center @3xl:justify-between @4xl:px-14">
            {/* Wide enough for the one-line description beside the form on a laptop. */}
            <div className="max-w-2xl">
              <h3 className="font-heading text-xl font-medium leading-tight @xl:text-2xl">
                {newsletter.title}
              </h3>
              {Boolean(newsletter.description) && (
                <p className="mt-1.5 text-sm text-white/85">{newsletter.description}</p>
              )}
            </div>
            <InlineEmailForm
              action={newsletter.action}
              className="w-full @3xl:max-w-[21rem]"
              placeholder={newsletter.placeholder}
              submitLabel={newsletter.submitLabel}
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-screen-2xl px-6 py-10 @xl:px-9 @4xl:px-14 @4xl:py-12">
        {/* Brand row: logo + blurb on the left, social icons on the right */}
        <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-start @3xl:justify-between">
          <div className="max-w-xl">
            <Logo
              className="flex"
              height={logoHeight}
              href={logoHref}
              label={logoLabel}
              logo={logo}
              width={logoWidth}
            />
            {Boolean(description) && (
              <p className="mt-3 text-sm leading-relaxed text-contrast-500">{description}</p>
            )}
            {/* Legacy contact block (only when no contact panel is provided) */}
            {!contactPanel && (
              <Stream fallback={null} value={streamableContactInformation}>
                {(contactInformation) => {
                  if (contactInformation?.address != null || contactInformation?.phone != null) {
                    return (
                      <div className="mt-4 text-sm">
                        <h3 className="font-semibold text-[var(--footer-contact-title,hsl(var(--contrast-500)))]">
                          {contactTitle}
                        </h3>
                        {Boolean(contactInformation.address) && <p>{contactInformation.address}</p>}
                        {Boolean(contactInformation.phone) && <p>{contactInformation.phone}</p>}
                      </div>
                    );
                  }

                  return null;
                }}
              </Stream>
            )}
          </div>

          <Stream fallback={<SocialMediaLinksSkeleton />} value={streamableSocialMediaLinks}>
            {(socialMediaLinks) =>
              socialMediaLinks != null && socialMediaLinks.length > 0 ? (
                <div className="flex items-center gap-2">
                  {socialMediaLinks.map(({ href, icon }, i) => (
                    <Link
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-contrast-200 fill-[var(--footer-social-icon,hsl(var(--contrast-400)))] p-2 ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 ease-out hover:border-foreground hover:fill-[var(--footer-social-icon-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 [&_svg]:h-4 [&_svg]:w-4"
                      href={href}
                      key={i}
                    >
                      {icon}
                    </Link>
                  ))}
                </div>
              ) : null
            }
          </Stream>
        </div>

        {/* Link columns + contact column */}
        <Stream fallback={<FooterColumnsSkeleton />} value={streamableSections}>
          {(sections) => (
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 @2xl:grid-cols-3 @5xl:grid-cols-6">
              {sections.map(({ title, links }, i) => (
                <div key={i}>
                  {title != null && (
                    <span className="mb-2 block text-sm font-semibold text-[var(--footer-section-title,hsl(var(--foreground)))]">
                      {title}
                    </span>
                  )}
                  <ul>
                    {links.map((link, idx) => (
                      <li key={idx}>
                        {link.href != null && link.href !== '' ? (
                          <Link
                            className={footerLinkClassName}
                            href={link.href}
                            rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                            target={link.target}
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <span className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wide text-foreground">
                            {link.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {contactPanel && (
                <div className="col-span-2 @2xl:col-span-1">
                  <span className="mb-2 block text-sm font-semibold text-[var(--footer-section-title,hsl(var(--foreground)))]">
                    {contactPanel.title}
                  </span>
                  <Link
                    className="inline-flex items-center gap-1.5 text-lg font-bold text-foreground hover:text-[var(--button-primary-background,#d90716)]"
                    href={contactPanel.phone.href}
                  >
                    <Phone size={16} strokeWidth={2} />
                    {contactPanel.phone.label}
                  </Link>
                  {contactPanel.hours && contactPanel.hours.length > 0 && (
                    <div className="mt-4 text-sm text-contrast-500">
                      {Boolean(contactPanel.hoursTitle) && (
                        <span className="block font-semibold text-foreground">
                          {contactPanel.hoursTitle}
                        </span>
                      )}
                      {contactPanel.hours.map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </div>
                  )}
                  {contactPanel.showrooms && contactPanel.showrooms.length > 0 && (
                    <div className="mt-4">
                      {Boolean(contactPanel.showroomsTitle) && (
                        <span className="mb-2 block text-sm font-semibold text-foreground">
                          {contactPanel.showroomsTitle}
                        </span>
                      )}
                      <ShowroomSelect label="Select showroom" showrooms={contactPanel.showrooms} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Stream>
      </div>

      {/* Legal strip */}
      <div className="border-t border-[var(--footer-border-top,hsl(var(--contrast-100)))]">
        <div className="mx-auto flex max-w-screen-2xl flex-col-reverse gap-4 px-6 py-4 @xl:px-9 @3xl:flex-row @3xl:items-center @3xl:justify-between @4xl:px-14">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--footer-copyright,hsl(var(--contrast-500)))]">
            <Stream fallback={<CopyrightSkeleton />} value={streamableCopyright}>
              {(copyright) => (copyright != null ? <span>{copyright}</span> : null)}
            </Stream>
            {legalLinks.map((link) =>
              link.href != null && link.href !== '' ? (
                <Link
                  className="transition-colors hover:text-[var(--button-primary-background,#d90716)]"
                  href={link.href}
                  key={link.label}
                >
                  {link.label}
                </Link>
              ) : (
                <span key={link.label}>{link.label}</span>
              ),
            )}
          </div>
          <Stream fallback={<PaymentIconsSkeleton />} value={streamablePaymentIcons}>
            {(paymentIcons) =>
              paymentIcons != null ? (
                <div className="flex flex-wrap items-center gap-2">{paymentIcons}</div>
              ) : null
            }
          </Stream>
        </div>
      </div>
    </footer>
  );
};

function SocialMediaLinksSkeleton() {
  return (
    <Skeleton.Root className="group-has-[[data-pending]]/footer:animate-pulse" pending>
      <div className="flex items-center gap-2" data-pending>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton.Box className="h-9 w-9 rounded-full" key={idx} />
        ))}
      </div>
    </Skeleton.Root>
  );
}

function FooterColumnsSkeleton() {
  return (
    <Skeleton.Root
      className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 @container-normal group-has-[[data-pending]]/footer:animate-pulse @2xl:grid-cols-3 @5xl:grid-cols-6"
      pending
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <div data-pending key={idx}>
          <div className="mb-3 flex items-center">
            <Skeleton.Text characterCount={10} className="rounded" />
          </div>
          <ul>
            {Array.from({ length: 5 }).map((_row, row) => (
              <li className="py-1.5 text-sm" key={row}>
                <Skeleton.Text characterCount={12} className="rounded" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Skeleton.Root>
  );
}

function CopyrightSkeleton() {
  return (
    <Skeleton.Root
      className="text-xs @container-normal group-has-[[data-pending]]/footer:animate-pulse"
      pending
    >
      <Skeleton.Text characterCount={24} className="rounded" data-pending />
    </Skeleton.Root>
  );
}

function PaymentIconsSkeleton() {
  return (
    <Skeleton.Root
      className="flex flex-wrap gap-2 @container-normal group-has-[[data-pending]]/footer:animate-pulse"
      pending
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <Skeleton.Box className="h-6 w-[2.1875rem] rounded" data-pending key={idx} />
      ))}
    </Skeleton.Root>
  );
}
