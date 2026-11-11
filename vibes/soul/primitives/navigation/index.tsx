'use client';

import { SubmissionResult, useForm } from '@conform-to/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import {
  ArrowRight,
  ChevronDown,
  GiftIcon,
  ImageIcon,
  MoreHorizontal,
  Search,
  SearchIcon,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import React, {
  forwardRef,
  type ReactNode,
  Ref,
  useActionState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { createPortal, useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { Logo } from '@/vibes/soul/primitives/logo';
import { Price } from '@/vibes/soul/primitives/price-label';
import { ProductCard } from '@/vibes/soul/primitives/product-card';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { usePathname, useRouter } from '~/i18n/routing';
import { useSearch } from '~/lib/search';

import { getLocalizedPathname } from './_actions/localized-pathname';

interface Link {
  label: string;
  href: string;
  // Optional visual grouping ('shop' | 'content'): consecutive items sharing a group render as a
  // cluster, with space inserted between different groups in the top nav bar.
  group?: string;
  // A link row at the foot of the mega menu ("All resources").
  panelLink?: { label: string; href: string };
  groups?: Array<{
    label?: string;
    href?: string;
    // Take the whole line (both columns) — for groups with many tiles.
    fullRow?: boolean;
    links: Array<{
      label: string;
      href: string;
      // Extra space before — starts a new cluster inside the row.
      spaceBefore?: boolean;
      // Square tile photo in the desktop mega menu.
      image?: { src: string; alt: string };
    }>;
  }>;
}

interface Locale {
  id: string;
  label: string;
}

interface Currency {
  id: string;
  label: string;
}

type Action<State, Payload> = (
  state: Awaited<State>,
  payload: Awaited<Payload>,
) => State | Promise<State>;

export type SearchResult =
  | {
      type: 'products';
      title: string;
      products: Array<{
        id: string;
        title: string;
        href: string;
        price?: Price;
        image?: { src: string; alt: string };
      }>;
    }
  | {
      type: 'links';
      title: string;
      links: Array<{ label: string; href: string }>;
    };

type CurrencyAction = Action<SubmissionResult | null, FormData>;
type SearchAction<S extends SearchResult> = Action<
  {
    searchResults: S[] | null;
    lastResult: SubmissionResult | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  FormData
>;

interface Props<S extends SearchResult> {
  className?: string;
  isFloating?: boolean;
  accountHref: string;
  /** Where the account icon goes once the customer is signed in (defaults to accountHref). */
  signedInAccountHref?: string;
  /** Signed-in state: shows a small solid green dot on the account icon. */
  isLoggedIn?: Streamable<boolean>;
  cartCount?: Streamable<number | null>;
  cartHref: string;
  links: Streamable<Link[]>;
  linksPosition?: 'center' | 'left' | 'right';
  locales?: Locale[];
  activeLocaleId?: string;
  currencies?: Currency[];
  activeCurrencyId?: Streamable<string | undefined>;
  currencyAction?: CurrencyAction;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  logoWidth?: number;
  logoHeight?: number;
  logoHref?: string;
  logoLabel?: string;
  mobileLogo?: Streamable<string | { src: string; alt: string } | null>;
  mobileLogoWidth?: number;
  mobileLogoHeight?: number;
  searchHref: string;
  searchParamName?: string;
  searchAction?: SearchAction<S>;
  searchInputPlaceholder?: string;
  searchSubmitLabel?: string;
  cartLabel?: string;
  accountLabel?: string;
  signedInAccountLabel?: string;
  openSearchPopupLabel?: string;
  searchLabel?: string;
  mobileMenuTriggerLabel?: string;
  switchCurrencyLabel?: string;
  giftCertificatesLabel?: string;
  giftCertificatesHref: string;
  giftCertificatesEnabled?: Streamable<boolean>;
  /** Audience-mode toggle (Homeowner/Pro), rendered in the top-right icon cluster. */
  audienceToggle?: ReactNode;
  /** Persistent CTA button (e.g. "Free Design Help"), rendered in the top-right cluster. */
  ctaButton?: ReactNode;
  /** Current audience mode — used by the header (e.g. utility bar tint in Pro mode). */
  audienceMode?: 'homeowner' | 'pro';
}

const MobileMenuButton = forwardRef<
  React.ComponentRef<'button'>,
  { open: boolean } & React.ComponentPropsWithoutRef<'button'>
>(({ open, className, ...rest }, ref) => {
  return (
    <button
      {...rest}
      className={clsx(
        'group relative rounded-lg p-2 outline-0 ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors focus-visible:ring-2',
        className,
      )}
      ref={ref}
    >
      <div className="flex h-4 w-4 origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
        <div
          className={clsx(
            'h-px origin-left transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px transform rounded bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-75 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px origin-left transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-150 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />

        <div
          className={clsx(
            'absolute top-2 flex transform items-center justify-between bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all duration-500',
            open ? 'w-12 translate-x-0' : 'w-0 -translate-x-10',
          )}
        >
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-300 duration-500',
              open ? 'rotate-45' : 'rotate-0',
            )}
          />
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-300 duration-500',
              open ? '-rotate-45' : 'rotate-0',
            )}
          />
        </div>
      </div>
    </button>
  );
});

MobileMenuButton.displayName = 'MobileMenuButton';

/**
 * One top-level row in the mobile menu. When the category has subcategories, they're collapsed
 * by default and the row becomes a toggle (chevron) that expands them on click — the full tree
 * is too long to show all at once. Categories without subcategories render as a plain link.
 */
function MobileMenuItem({ item, onNavigate }: { item: Link; onNavigate: () => void }) {
  const subLinks = item.groups?.flatMap((group) => group.links) ?? [];
  const hasSubLinks = subLinks.length > 0;
  const [open, setOpen] = useState(false);

  const rowClassName =
    'flex w-full items-center justify-between gap-2 rounded-lg bg-[var(--nav-mobile-link-background,transparent)] px-3 py-2 text-left font-[family-name:var(--nav-mobile-link-font-family,var(--font-family-body))] text-[15px] font-semibold text-[var(--nav-mobile-link-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-mobile-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-mobile-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4';

  return (
    <ul className="flex flex-col p-2 @4xl:gap-2 @4xl:p-5">
      {item.label !== '' && (
        <li>
          {hasSubLinks ? (
            <button
              aria-expanded={open}
              className={rowClassName}
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
              <span>{item.label}</span>
              <ChevronDown
                className={clsx('shrink-0 transition-transform duration-200', open && 'rotate-180')}
                size={18}
                strokeWidth={1.5}
              />
            </button>
          ) : (
            <Link className={rowClassName} href={item.href} onClick={onNavigate}>
              {item.label}
            </Link>
          )}
        </li>
      )}
      {hasSubLinks &&
        open &&
        (item.groups ?? []).map((group, g) => (
          // Each group (Cabinets, Countertops…) keeps its heading on mobile, with space before it,
          // so a long category reads as sections rather than one run of links.
          <li className={clsx(g > 0 && 'mt-3')} key={g}>
            {group.label != null && group.label !== '' && (
              <GroupHeading href={group.href} label={group.label} onNavigate={onNavigate} />
            )}
            <ul>
              {group.links.map((link, j) => (
                <li key={j}>
                  <Link
                    className="block rounded-lg bg-[var(--nav-mobile-sub-link-background,transparent)] px-3 py-2 pl-6 font-[family-name:var(--nav-mobile-sub-link-font-family,var(--font-family-body))] text-[13px] font-medium text-[var(--nav-mobile-sub-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-mobile-sub-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-mobile-sub-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                    href={link.href}
                    onClick={onNavigate}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
    </ul>
  );
}

// A group's name inside an expanded mobile category: small caps, red when it links somewhere.
function GroupHeading({
  label,
  href,
  onNavigate,
}: {
  label: string;
  href?: string;
  onNavigate: () => void;
}) {
  const className =
    'block px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--nav-mobile-group-text,hsl(var(--foreground)))]';

  return href ? (
    <Link
      className={clsx(className, 'hover:text-[var(--button-primary-background,#d90716)]')}
      href={href}
      onClick={onNavigate}
    >
      {label}
    </Link>
  ) : (
    <span className={className}>{label}</span>
  );
}

const navLinkClassName =
  'hidden items-center whitespace-nowrap rounded-full bg-[var(--nav-link-background,transparent)] px-3.5 py-2 font-[family-name:var(--nav-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-link-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors duration-200 hover:text-[var(--button-primary-background,#d90716)] focus-visible:outline-0 focus-visible:ring-2 data-[state=open]:text-[var(--button-primary-background,#d90716)] @[700px]:inline-flex';
const navSubLinkClassName =
  'block rounded-lg bg-[var(--nav-sub-link-background,transparent)] px-3 py-1.5 font-[family-name:var(--nav-sub-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-sub-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-sub-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-sub-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2';
const navGroupClassName =
  'block rounded-lg bg-[var(--nav-group-background,transparent)] px-3 py-2 font-[family-name:var(--nav-group-font-family,var(--font-family-body))] font-medium text-[var(--nav-group-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-group-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-group-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2';

// The group's name as a grey square at the start of its row, the same size as the photo tiles
// beside it. When the group has a landing page the tile is a link: on hover it turns black with
// white text and an arrow slides in under the name. A plain heading has no hover at all.
function GroupTile({ label, href }: { label: string; href?: string }) {
  const className =
    'flex aspect-square w-20 items-center justify-center rounded-lg bg-[var(--nav-tile-background,hsl(var(--contrast-100)))] px-2 text-center text-[13px] font-semibold leading-snug @[1100px]:w-[100px] @[1100px]:text-sm @[1360px]:w-[120px] @[1360px]:px-3 @[1360px]:text-[15px] text-[var(--nav-group-text,hsl(var(--foreground)))] ring-1 ring-[hsl(var(--foreground)/6%)] transition-colors duration-300 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--nav-focus,hsl(var(--primary)))]';

  if (href != null && href !== '' && href !== '#') {
    return (
      <Link
        className={clsx(
          className,
          'group/tile flex-col hover:bg-foreground hover:text-white focus-visible:bg-foreground focus-visible:text-white',
        )}
        href={href}
      >
        {label}
        <ArrowRight
          aria-hidden
          className="mt-1 h-0 -translate-y-3 opacity-0 transition-[height,opacity,transform] duration-300 group-hover/tile:h-4 group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:h-4 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100"
          size={16}
          strokeWidth={2.5}
        />
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}

// Square photo tile in the desktop mega menu: the photo lifts and zooms a little on hover, the
// label sits beneath. A soft placeholder (image icon) shows until a photo is set in menu-config.
function MenuTile({
  label,
  href,
  image,
}: {
  label: string;
  href: string;
  image?: { src: string; alt: string };
}) {
  return (
    <Link
      className="group/tile flex w-20 flex-col gap-2 rounded-lg ring-[var(--nav-focus,hsl(var(--primary)))] focus-visible:outline-0 focus-visible:ring-2 @[1100px]:w-[100px] @[1360px]:w-[120px]"
      href={href}
    >
      <span className="relative block aspect-square overflow-hidden rounded-lg bg-[var(--nav-tile-background,hsl(var(--contrast-100)))] ring-1 ring-[hsl(var(--foreground)/6%)] transition-[transform,box-shadow] duration-300 ease-out group-hover/tile:-translate-y-0.5 group-hover/tile:shadow-[0_14px_28px_-16px_rgb(0_0_0/0.35)]">
        {image ? (
          <Image
            alt={image.alt}
            className="object-cover transition-transform duration-500 ease-out group-hover/tile:scale-105"
            fill
            // The tiles are tiny (2–10 KB); load them with the page so the menu opens complete.
            loading="eager"
            sizes="120px"
            src={image.src}
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center text-contrast-300"
          >
            <ImageIcon size={26} strokeWidth={1.25} />
          </span>
        )}
      </span>
      <span className="px-0.5 text-center text-[13px] font-medium leading-snug text-[var(--nav-sub-link-text,hsl(var(--contrast-500)))] transition-colors group-hover/tile:text-[var(--nav-sub-link-text-hover,hsl(var(--foreground)))]">
        {label}
      </span>
    </Link>
  );
}

// Hover: no grey box behind the icon; the icon turns EK red (same red as the menu links) and
// grows a touch (search, account, cart, gift certificates, mobile menu trigger and close all
// share this class). Scale is skipped for reduced-motion users.
const navButtonClassName =
  'relative rounded-lg bg-[var(--nav-button-background,transparent)] p-1.5 text-[var(--nav-button-icon,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-[color,background-color,transform] duration-200 focus-visible:outline-0 focus-visible:ring-2 hover:bg-[var(--nav-button-background-hover,transparent)] hover:text-[var(--nav-button-icon-hover,var(--button-primary-background,#d90716))] motion-safe:hover:scale-110';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --nav-focus: hsl(var(--primary));
 *   --nav-background: hsl(var(--background));
 *   --nav-floating-border: hsl(var(--foreground) / 10%);
 *   --nav-link-text: hsl(var(--foreground));
 *   --nav-link-text-hover: hsl(var(--foreground));
 *   --nav-link-background: transparent;
 *   --nav-link-background-hover: hsl(var(--contrast-100));
 *   --nav-link-font-family: var(--font-family-body);
 *   --nav-group-text: hsl(var(--foreground));
 *   --nav-group-text-hover: hsl(var(--foreground));
 *   --nav-group-background: transparent;
 *   --nav-group-background-hover: hsl(var(--contrast-100));
 *   --nav-group-font-family: var(--font-family-body);
 *   --nav-sub-link-text: hsl(var(--contrast-500));
 *   --nav-sub-link-text-hover: hsl(var(--foreground));
 *   --nav-sub-link-background: transparent;
 *   --nav-sub-link-background-hover: hsl(var(--contrast-100));
 *   --nav-sub-link-font-family: var(--font-family-body);
 *   --nav-button-icon: hsl(var(--foreground));
 *   --nav-button-icon-hover: var(--button-primary-background);
 *   --nav-button-background: hsl(var(--background));
 *   --nav-button-background-hover: transparent;
 *   --nav-menu-background: hsl(var(--background));
 *   --nav-menu-border: hsl(var(--foreground) / 5%);
 *   --nav-mobile-background: hsl(var(--background));
 *   --nav-mobile-divider: hsl(var(--contrast-100));
 *   --nav-mobile-button-icon: hsl(var(--foreground));
 *   --nav-mobile-link-text: hsl(var(--foreground));
 *   --nav-mobile-link-text-hover: hsl(var(--foreground));
 *   --nav-mobile-link-background: transparent;
 *   --nav-mobile-link-background-hover: hsl(var(--contrast-100));
 *   --nav-mobile-link-font-family: var(--font-family-body);
 *   --nav-mobile-sub-link-text: hsl(var(--contrast-500));
 *   --nav-mobile-sub-link-text-hover: hsl(var(--foreground));
 *   --nav-mobile-sub-link-background: transparent;
 *   --nav-mobile-sub-link-background-hover: hsl(var(--contrast-100));
 *   --nav-mobile-sub-link-font-family: var(--font-family-body);
 *   --nav-search-background: hsl(var(--background));
 *   --nav-search-border: hsl(var(--foreground) / 5%);
 *   --nav-search-divider: hsl(var(--foreground) / 5%);
 *   --nav-search-icon: hsl(var(--contrast-500));
 *   --nav-search-empty-title: hsl(var(--foreground));
 *   --nav-search-empty-subtitle: hsl(var(--contrast-500));
 *   --nav-search-result-title: hsl(var(--foreground));
 *   --nav-search-result-title-font-family: var(--font-family-mono);
 *   --nav-search-result-link-text: hsl(var(--foreground));
 *   --nav-search-result-link-text-hover: hsl(var(--foreground));
 *   --nav-search-result-link-background: hsl(var(--background));
 *   --nav-search-result-link-background-hover: hsl(var(--contrast-100));
 *   --nav-search-result-link-font-family: var(--font-family-body);
 *   --nav-cart-count-text: hsl(var(--background));
 *   --nav-cart-count-background: hsl(var(--foreground));
 *   --nav-locale-background: hsl(var(--background));
 *   --nav-locale-link-text: hsl(var(--contrast-400));
 *   --nav-locale-link-text-hover: hsl(var(--foreground));
 *   --nav-locale-link-text-selected: hsl(var(--foreground));
 *   --nav-locale-link-background: transparent;
 *   --nav-locale-link-background-hover: hsl(var(--contrast-100));
 *   --nav-locale-link-font-family: var(--font-family-body);
 * }
 * ```
 */
export const Navigation = forwardRef(function Navigation<S extends SearchResult>(
  {
    className,
    isFloating = false,
    cartHref,
    cartCount: streamableCartCount,
    accountHref,
    signedInAccountHref = accountHref,
    isLoggedIn: streamableIsLoggedIn = false,
    links: streamableLinks,
    logo: streamableLogo,
    logoHref = '/',
    logoLabel = 'Home',
    logoWidth = 200,
    logoHeight = 40,
    mobileLogo: streamableMobileLogo,
    mobileLogoWidth = 100,
    mobileLogoHeight = 40,
    linksPosition = 'center',
    activeLocaleId,
    locales,
    currencies: streamableCurrencies,
    activeCurrencyId: streamableActiveCurrencyId,
    currencyAction,
    searchHref,
    searchParamName = 'query',
    searchAction,
    searchInputPlaceholder,
    searchSubmitLabel,
    cartLabel = 'Cart',
    accountLabel = 'Profile',
    signedInAccountLabel = 'Your account, signed in',
    openSearchPopupLabel = 'Open search popup',
    searchLabel = 'Search',
    mobileMenuTriggerLabel = 'Toggle navigation',
    switchCurrencyLabel,
    giftCertificatesLabel = 'Gift Certificates',
    giftCertificatesHref,
    giftCertificatesEnabled: streamableGiftCertificatesEnabled,
    audienceToggle,
    ctaButton,
    // Consumed by HeaderSection (utility-bar tint); accepted here so it's a valid navigation prop
    // and not spread onto the DOM.
    audienceMode: _audienceMode,
  }: Props<S>,
  ref: Ref<HTMLDivElement>,
) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSearchOpen, setIsSearchOpen } = useSearch();

  // The mega menu is controlled so a click on a top-level link (which navigates) closes it and
  // keeps it closed: Radix reopens on the next pointer move over the still-hovered trigger, which
  // read as the menu "going and coming back". Hover opening resumes once the pointer leaves the
  // nav (or a key is pressed, so keyboard users aren't locked out).
  const [menuValue, setMenuValue] = useState('');
  const hoverSuppressed = useRef(false);

  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setMenuValue('');
  }, [pathname, setIsSearchOpen]);

  useEffect(() => {
    function handleScroll() {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsSearchOpen]);

  // Full-screen mobile menu: close on Escape and lock page scroll while it is open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  // ── "Priority+" overflow for the desktop links ────────────────────────────────────────────
  // Every top-level item stays mounted (its mega-menu must keep working); the ones that don't fit
  // the row are display:none'd, last first, and listed under a "…" item. Each item's width is
  // captured while it is visible and reused afterwards, so a resize is a pure calculation — no
  // network, no re-render of the items themselves, and it runs before paint (useLayoutEffect).
  const linksWrapRef = useRef<HTMLDivElement | null>(null);
  const moreItemRef = useRef<HTMLLIElement | null>(null);
  const itemElsRef = useRef(new Map<number, HTMLLIElement>());
  const itemWidthsRef = useRef(new Map<number, number>());
  const itemRefCallbacksRef = useRef(new Map<number, (el: HTMLLIElement | null) => void>());
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  const measureOverflow = useCallback(() => {
    const wrap = linksWrapRef.current;

    // Hidden (phone layout) → nothing to measure; the observer re-runs this when it shows again.
    if (!wrap || wrap.clientWidth === 0) return;

    const ITEM_GAP = 4; // ul gap-1
    const CLUSTER_GAP = 40; // wrapper gap-10 between the shop and content clusters
    const positions = [...itemElsRef.current.keys()].sort((a, b) => a - b);

    positions.forEach((position) => {
      const el = itemElsRef.current.get(position);

      // offsetParent is null while display:none — keep the width captured when it was visible.
      if (el && el.offsetParent !== null) {
        itemWidthsRef.current.set(position, el.getBoundingClientRect().width);
      }
    });

    const total = positions.length;

    if (total === 0) return;

    const widths = positions.map((position) => itemWidthsRef.current.get(position) ?? 0);
    const available = wrap.clientWidth - CLUSTER_GAP;
    const moreWidth = moreItemRef.current?.getBoundingClientRect().width ?? 48;
    const allWidth = widths.reduce((sum, width) => sum + width + ITEM_GAP, 0);
    let next = total;

    if (allWidth > available) {
      let used = moreWidth + ITEM_GAP;

      // Index of the first item that no longer fits (−1 = they all fit next to the "…").
      const firstOverflow = widths.findIndex((width) => {
        if (used + width + ITEM_GAP > available) return true;

        used += width + ITEM_GAP;

        return false;
      });

      next = firstOverflow === -1 ? widths.length : firstOverflow;
    }

    setVisibleCount((current) => (current === next ? current : next));

    // An item that has never been visible has no width yet (e.g. first render on a phone, then
    // resized up) — measure once more after it paints.
    if (widths.some((width) => width === 0)) requestAnimationFrame(measureOverflow);
  }, []);

  // One stable callback ref per item position (created lazily) so React doesn't re-register
  // every render. Items mount after the links stream resolves, so measure when they appear.
  const getItemRef = useCallback(
    (position: number) => {
      let callback = itemRefCallbacksRef.current.get(position);

      if (!callback) {
        callback = (el: HTMLLIElement | null) => {
          if (el) {
            itemElsRef.current.set(position, el);
            requestAnimationFrame(measureOverflow);
          } else {
            itemElsRef.current.delete(position);
          }
        };

        itemRefCallbacksRef.current.set(position, callback);
      }

      return callback;
    },
    [measureOverflow],
  );

  useLayoutEffect(() => {
    const wrap = linksWrapRef.current;

    if (!wrap) return;

    measureOverflow();

    const observer = new ResizeObserver(() => measureOverflow());

    observer.observe(wrap);

    return () => observer.disconnect();
  }, [measureOverflow]);

  return (
    <NavigationMenu.Root
      className={clsx('relative mx-auto w-full max-w-screen-2xl @container', className)}
      delayDuration={0}
      onKeyDown={() => {
        hoverSuppressed.current = false;
      }}
      onPointerLeave={() => {
        hoverSuppressed.current = false;
      }}
      onValueChange={(value) => {
        setIsSearchOpen(false);

        if (value !== '' && hoverSuppressed.current) return;

        setMenuValue(value);
      }}
      ref={ref}
      value={menuValue}
    >
      <div
        className={clsx(
          // Always the "floating card" look (rounded, ring, shadow) — the same treatment at rest as
          // when the header is pinned on scroll; the shadow just deepens a little while floating.
          // Inner inset is tuned so the logo lands on the page's content gutter (24 / 36 / 56px):
          // card edge (16 / 24 / 32) + inset (8 / 12 / 24).
          'flex items-center justify-between gap-1 rounded-2xl border-b border-contrast-100 bg-[var(--nav-background,hsl(var(--background)))] py-[11px] pl-2 pr-2 ring-1 transition-shadow @xl:pl-3 @4xl:px-2 @4xl:pl-6 @4xl:pr-2.5',
          // At rest: a soft, low-opacity shadow (shadow-lg geometry at half its opacity) and a
          // lighter ring. Floating (pinned on scroll): the full shadow-xl + 10% ring.
          isFloating
            ? 'shadow-xl ring-[var(--nav-floating-border,hsl(var(--foreground)/10%))]'
            : 'shadow-[0_10px_15px_-3px_rgb(0_0_0/0.05),0_4px_6px_-4px_rgb(0_0_0/0.04)] ring-[hsl(var(--foreground)/6%)]',
        )}
      >
        {/* Mobile Menu — a full-screen white overlay (portaled to <body> so the header's
            transform/positioning can't clip it): close X top-right, the menu items below, and
            the Free Design Consult CTA pinned to the bottom. The hamburger that opens it sits at
            the right end of the icon cluster (below). */}
        {isMobileMenuOpen &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              aria-label={mobileMenuTriggerLabel}
              aria-modal="true"
              className="fixed inset-0 z-[100] flex flex-col bg-[var(--nav-mobile-background,hsl(var(--background)))] @container"
              role="dialog"
            >
              <div className="flex items-center justify-end border-b border-[var(--nav-mobile-divider,hsl(var(--contrast-100)))] px-4 py-3">
                <button
                  aria-label="Close menu"
                  className={navButtonClassName}
                  onClick={() => setIsMobileMenuOpen(false)}
                  type="button"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 divide-y divide-[var(--nav-mobile-divider,hsl(var(--contrast-100)))] overflow-y-auto">
                <Stream
                  fallback={
                    <ul className="flex animate-pulse flex-col gap-4 p-5 @4xl:gap-2 @4xl:p-5">
                      <li>
                        <span className="block h-4 w-10 rounded-md bg-contrast-100" />
                      </li>
                      <li>
                        <span className="block h-4 w-14 rounded-md bg-contrast-100" />
                      </li>
                      <li>
                        <span className="block h-4 w-24 rounded-md bg-contrast-100" />
                      </li>
                      <li>
                        <span className="block h-4 w-16 rounded-md bg-contrast-100" />
                      </li>
                    </ul>
                  }
                  value={streamableLinks}
                >
                  {(links) =>
                    links.map((item, i) => (
                      <MobileMenuItem
                        item={item}
                        key={i}
                        onNavigate={() => setIsMobileMenuOpen(false)}
                      />
                    ))
                  }
                </Stream>
                {/* Mobile Locale / Currency Dropdown */}
                {locales && locales.length > 1 && streamableCurrencies && (
                  <div className="p-2 @4xl:p-5">
                    <div className="flex items-center px-3 py-1 @4xl:py-2">
                      {/* Locale / Language Dropdown */}
                      {locales.length > 1 ? (
                        <LocaleSwitcher
                          activeLocaleId={activeLocaleId}
                          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                          locales={locales as [Locale, Locale, ...Locale[]]}
                        />
                      ) : null}

                      {/* Currency Dropdown */}
                      <Stream
                        fallback={null}
                        value={Streamable.all([streamableCurrencies, streamableActiveCurrencyId])}
                      >
                        {([currencies, activeCurrencyId]) =>
                          currencies.length > 1 && currencyAction ? (
                            <CurrencyForm
                              action={currencyAction}
                              activeCurrencyId={activeCurrencyId}
                              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                              currencies={currencies as [Currency, ...Currency[]]}
                            />
                          ) : null
                        }
                      </Stream>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: the CTA, full width, 1.25× its usual height (x-small is 32px → 40px). */}
              {ctaButton != null && (
                <div className="border-t border-[var(--nav-mobile-divider,hsl(var(--contrast-100)))] p-4 [&_a]:flex [&_a]:!min-h-10 [&_a]:w-full [&_a]:justify-center [&_a]:!text-sm">
                  {ctaButton}
                </div>
              )}
            </div>,
            document.body,
          )}

        {/* Logo */}
        <div
          className={clsx(
            'flex items-center justify-start self-stretch',
            linksPosition === 'center' ? 'flex-1' : 'flex-1 @[700px]:flex-none',
          )}
        >
          <Logo
            className={clsx(streamableMobileLogo != null ? 'hidden @[700px]:flex' : 'flex')}
            height={logoHeight}
            href={logoHref}
            label={logoLabel}
            logo={streamableLogo}
            width={logoWidth}
          />
          {streamableMobileLogo != null && (
            <Logo
              className="flex @[700px]:hidden"
              height={mobileLogoHeight}
              href={logoHref}
              label={logoLabel}
              logo={streamableMobileLogo}
              width={mobileLogoWidth}
            />
          )}
        </div>

        {/* Top Level Nav Links — two clusters (shop group, content group) inside one measured
            wrapper. Items keep their original index (i) as the NavigationMenu.Item value so the
            mega-menu still works across both lists. Items that don't fit the wrapper are hidden
            (last first) and collected under the "…" item at the end of the content cluster. */}
        <div
          className="hidden min-w-0 flex-1 items-center justify-evenly gap-10 @[700px]:flex"
          ref={linksWrapRef}
        >
          <Stream
            fallback={
              <ul className="hidden min-h-[41px] animate-pulse flex-row items-center @4xl:flex @4xl:gap-6 @4xl:p-2.5">
                <li>
                  <span className="block h-4 w-10 rounded-md bg-contrast-100" />
                </li>
                <li>
                  <span className="block h-4 w-14 rounded-md bg-contrast-100" />
                </li>
                <li>
                  <span className="block h-4 w-24 rounded-md bg-contrast-100" />
                </li>
                <li>
                  <span className="block h-4 w-16 rounded-md bg-contrast-100" />
                </li>
              </ul>
            }
            value={streamableLinks}
          >
            {(links) => {
              const shownCount = visibleCount ?? links.length;
              const renderItem = (item: Link, i: number, position: number) => (
                <NavigationMenu.Item
                  key={i}
                  ref={getItemRef(position)}
                  style={position >= shownCount ? { display: 'none' } : undefined}
                  value={i.toString()}
                >
                  <NavigationMenu.Trigger asChild>
                    <Link
                      className={navLinkClassName}
                      href={item.href}
                      onClick={() => {
                        hoverSuppressed.current = true;
                        setMenuValue('');
                      }}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenu.Trigger>
                  {item.groups != null && item.groups.length > 0 && (
                    <NavigationMenu.Content className="rounded-2xl bg-[var(--nav-menu-background,hsl(var(--background)))] shadow-xl ring-1 ring-[var(--nav-menu-border,hsl(var(--foreground)/5%))] duration-300 data-[motion=from-end]:animate-in data-[motion=from-start]:animate-in data-[motion=to-end]:animate-out data-[motion=to-start]:animate-out data-[motion=from-end]:fade-in data-[motion=from-start]:fade-in data-[motion=to-end]:fade-out data-[motion=to-start]:fade-out data-[motion=from-end]:slide-in-from-right-6 data-[motion=from-start]:slide-in-from-left-6 data-[motion=to-end]:slide-out-to-right-6 data-[motion=to-start]:slide-out-to-left-6">
                      {/* Each group is a block: a grey heading tile, then the links as square photo
                          tiles. The blocks fill a two-column grid in config order — Cabinets beside
                          Cabinet Hardware, Countertops beside Sale, Sinks & Faucets on its own.
                          Tiles scale with the nav width (80 → 100 → 120px) so nothing overflows;
                          below 900px the grid drops to one column so the row still fits. */}
                      <div className="grid w-full grid-cols-[minmax(0,max-content)] justify-center gap-x-8 gap-y-7 px-6 pb-7 pt-5 @[900px]:grid-cols-[minmax(0,max-content)_minmax(0,max-content)] @[1100px]:gap-x-12 @[1360px]:gap-x-24 @[1360px]:px-8 @[1360px]:pb-8 @[1360px]:pt-6">
                        {item.groups.map((group, groupIndex) => (
                          <div
                            className={clsx(
                              'ek-menu-row flex min-w-0 items-start gap-3.5',
                              group.fullRow && '@[900px]:col-span-2',
                            )}
                            key={groupIndex}
                            style={{ animationDelay: `${Math.floor(groupIndex / 2) * 240}ms` }}
                          >
                            {group.label != null && group.label !== '' && (
                              <GroupTile href={group.href} label={group.label} />
                            )}
                            {(group.label == null || group.label === '') &&
                              item.groups?.some((g) => g.label) && (
                                // Unlabelled group in a menu that has headings: keep an empty slot
                                // so its tiles line up with the row above.
                                <span
                                  aria-hidden
                                  className="w-20 shrink-0 @[1100px]:w-[100px] @[1360px]:w-[120px]"
                                />
                              )}
                            <ul className="flex min-w-0 flex-1 flex-wrap gap-x-3.5 gap-y-4">
                              {group.links.map((link, idx) => (
                                // Each tile rises in turn when the panel opens (see ek-tile-in in globals.css).
                                <li
                                  className={clsx('ek-menu-tile', link.spaceBefore && 'ml-6')}
                                  key={idx}
                                  style={{
                                    animationDelay: `${Math.floor(groupIndex / 2) * 240 + Math.min(idx, 12) * 30}ms`,
                                  }}
                                >
                                  <MenuTile
                                    href={link.href}
                                    image={link.image}
                                    label={link.label}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {item.panelLink != null && (
                          // Full-width last row, so the link lines up with the heading tiles.
                          <div className="-mt-2 border-t border-[hsl(var(--foreground)/6%)] pt-4 @[900px]:col-span-2">
                            <Link
                              className="group/all inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-[var(--button-primary-background,#d90716)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--nav-focus,hsl(var(--primary)))]"
                              href={item.panelLink.href}
                              onClick={() => {
                                hoverSuppressed.current = true;
                                setMenuValue('');
                              }}
                            >
                              {item.panelLink.label}
                              <ArrowRight
                                aria-hidden
                                className="transition-transform group-hover/all:translate-x-1"
                                size={15}
                                strokeWidth={2.5}
                              />
                            </Link>
                          </div>
                        )}
                      </div>
                    </NavigationMenu.Content>
                  )}
                </NavigationMenu.Item>
              );

              // Preserve original indices when filtering so each item's mega-menu value is stable.
              // `position` is the item's place in row order (shop cluster first) — overflow hides
              // from the highest position down.
              const shop = links.filter((item) => item.group !== 'content');
              const content = links.filter((item) => item.group === 'content');
              const ordered = [...shop, ...content].map((item, position) => ({
                item,
                i: links.indexOf(item),
                position,
              }));
              const hidden = ordered.slice(shownCount);

              return (
                <>
                  <ul className="hidden gap-1 @[700px]:flex">
                    {ordered
                      .filter(({ item }) => item.group !== 'content')
                      .map(({ item, i, position }) => renderItem(item, i, position))}
                  </ul>
                  <ul className="hidden gap-1 @[700px]:flex">
                    {ordered
                      .filter(({ item }) => item.group === 'content')
                      .map(({ item, i, position }) => renderItem(item, i, position))}
                    {/* "…" — the items that didn't fit, with their sub-links. */}
                    {hidden.length > 0 && (
                      <NavigationMenu.Item ref={moreItemRef} value="more">
                        <NavigationMenu.Trigger
                          aria-label="More menu items"
                          className={clsx(navLinkClassName, 'px-2.5')}
                        >
                          <MoreHorizontal size={20} strokeWidth={1.5} />
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content className="rounded-2xl bg-[var(--nav-menu-background,hsl(var(--background)))] shadow-xl ring-1 ring-[var(--nav-menu-border,hsl(var(--foreground)/5%))]">
                          <div className="m-auto grid w-full max-w-screen-lg grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-5 px-5 pb-8 pt-5">
                            {hidden.map(({ item, i }) => (
                              <ul className="flex flex-col" key={i}>
                                <li>
                                  <Link className={navGroupClassName} href={item.href}>
                                    {item.label}
                                  </Link>
                                </li>
                                {(item.groups ?? []).map((group, groupIndex) => (
                                  <React.Fragment key={groupIndex}>
                                    {group.label != null && group.label !== '' && (
                                      <li className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-contrast-400">
                                        {group.href ? (
                                          // A group with its own page (e.g. Cabinets → /cabinets)
                                          // is tappable here, as its heading is on desktop.
                                          <Link
                                            className="underline-offset-2 hover:underline"
                                            href={group.href}
                                          >
                                            {group.label}
                                          </Link>
                                        ) : (
                                          group.label
                                        )}
                                      </li>
                                    )}
                                    {group.links.map((link, idx) => (
                                      <li className={clsx(link.spaceBefore && 'mt-3')} key={idx}>
                                        <Link className={navSubLinkClassName} href={link.href}>
                                          {link.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </React.Fragment>
                                ))}
                              </ul>
                            ))}
                          </div>
                        </NavigationMenu.Content>
                      </NavigationMenu.Item>
                    )}
                  </ul>
                </>
              );
            }}
          </Stream>
        </div>

        {/* Icon Buttons */}
        <div
          className={clsx(
            'flex items-center justify-end gap-0.5 transition-colors duration-300',
            linksPosition === 'center' ? 'flex-1' : 'flex-1 @[700px]:flex-none',
          )}
        >
          {/* CTA stays in the row at every desktop width — the links overflow into "…" before it
              ever goes. On phones it moves to the bottom of the mobile menu instead. */}
          {ctaButton != null && <div className="mr-3 hidden @[700px]:block">{ctaButton}</div>}
          {audienceToggle != null && (
            <div className="mr-4 hidden @[1400px]:ml-2 @[1400px]:block">{audienceToggle}</div>
          )}
          {searchAction ? (
            <Popover.Root onOpenChange={setIsSearchOpen} open={isSearchOpen}>
              <Popover.Trigger asChild>
                <button
                  aria-label={openSearchPopupLabel}
                  className={navButtonClassName}
                  onPointerEnter={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                  onPointerMove={(e) => e.preventDefault()}
                >
                  <Search size={20} strokeWidth={1} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                {/* Anchor to the trigger with explicit positioning instead of the nav-width anchor
                    variable, which measures 0px in this environment (collapsing the bar to
                    invisible / mispositioned top-right). This drops a full-width search bar just
                    below the nav: width = viewport minus page gutter, aligned to the nav edges. */}
                <Popover.Content
                  align="end"
                  className="max-h-[calc(var(--radix-popover-content-available-height)-16px)] w-[calc(100vw-2rem)] max-w-screen-2xl py-2 @container data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                  collisionPadding={16}
                  side="bottom"
                  sideOffset={12}
                >
                  <div className="flex max-h-[inherit] flex-col rounded-2xl bg-[var(--nav-search-background,hsl(var(--background)))] shadow-xl ring-1 ring-[var(--nav-search-border,hsl(var(--foreground)/5%))] transition-all duration-200 ease-in-out @4xl:inset-x-0">
                    <SearchForm
                      searchAction={searchAction}
                      searchHref={searchHref}
                      searchInputPlaceholder={searchInputPlaceholder}
                      searchParamName={searchParamName}
                      searchSubmitLabel={searchSubmitLabel}
                    />
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ) : (
            <Link aria-label={searchLabel} className={navButtonClassName} href={searchHref}>
              <Search size={20} strokeWidth={1} />
            </Link>
          )}

          <Stream
            fallback={
              <Link aria-label={accountLabel} className={navButtonClassName} href={accountHref}>
                <User size={20} strokeWidth={1} />
              </Link>
            }
            value={streamableIsLoggedIn}
          >
            {(isLoggedIn) => (
              <Link
                aria-label={isLoggedIn ? signedInAccountLabel : accountLabel}
                className={navButtonClassName}
                href={isLoggedIn ? signedInAccountHref : accountHref}
              >
                <User size={20} strokeWidth={1} />
                {isLoggedIn && (
                  // Signed-in status dot: solid green, ringed in the nav background so it reads
                  // as a badge on the icon rather than part of it (like a presence indicator).
                  <span
                    aria-hidden
                    className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#22c55e] ring-2 ring-[var(--nav-background,hsl(var(--background)))]"
                  />
                )}
              </Link>
            )}
          </Stream>
          <Link aria-label={cartLabel} className={navButtonClassName} href={cartHref}>
            <ShoppingBag size={20} strokeWidth={1} />
            <Stream
              fallback={
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-contrast-100 text-xs text-background" />
              }
              value={streamableCartCount}
            >
              {(cartCount) =>
                cartCount != null &&
                cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--nav-cart-count-background,hsl(var(--foreground)))] font-[family-name:var(--nav-cart-count-font-family,var(--font-family-body))] text-xs text-[var(--nav-cart-count-text,hsl(var(--background)))]">
                    {cartCount}
                  </span>
                )
              }
            </Stream>
          </Link>

          <Stream fallback={null} value={streamableGiftCertificatesEnabled}>
            {(giftCertificatesEnabled) =>
              giftCertificatesEnabled && (
                <Link
                  aria-label={giftCertificatesLabel}
                  className={navButtonClassName}
                  href={giftCertificatesHref}
                >
                  <GiftIcon size={20} strokeWidth={1} />
                </Link>
              )
            }
          </Stream>

          {/* Hamburger — last in the icon cluster, after the cart, with a little extra room to
              its left. Opens the full-screen mobile menu (portaled above). */}
          <MobileMenuButton
            aria-label={mobileMenuTriggerLabel}
            className="ml-3 @[700px]:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            open={isMobileMenuOpen}
          />

          {/* Locale / Language Dropdown */}
          {locales && locales.length > 1 ? (
            <LocaleSwitcher
              activeLocaleId={activeLocaleId}
              className="hidden @4xl:block"
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              locales={locales as [Locale, Locale, ...Locale[]]}
            />
          ) : null}

          {/* Currency Dropdown */}
          <Stream
            fallback={null}
            value={Streamable.all([streamableCurrencies, streamableActiveCurrencyId])}
          >
            {([currencies, activeCurrencyId]) =>
              currencies && currencies.length > 1 && currencyAction ? (
                <CurrencyForm
                  action={currencyAction}
                  activeCurrencyId={activeCurrencyId}
                  className="hidden @4xl:block"
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  currencies={currencies as [Currency, ...Currency[]]}
                  switchCurrencyLabel={switchCurrencyLabel}
                />
              ) : null
            }
          </Stream>
        </div>
      </div>

      <div className="perspective-[2000px] absolute left-0 right-0 top-full z-50 flex w-full justify-center">
        <NavigationMenu.Viewport className="relative mt-2 w-full duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-3" />
      </div>
    </NavigationMenu.Root>
  );
});

Navigation.displayName = 'Navigation';

function SearchForm<S extends SearchResult>({
  searchAction,
  searchParamName = 'query',
  searchHref = '/search',
  searchInputPlaceholder = 'Search Products',
  searchSubmitLabel = 'Submit',
}: {
  searchAction: SearchAction<S>;
  searchParamName?: string;
  searchHref?: string;
  searchInputPlaceholder?: string;
  searchSubmitLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [isSearching, startSearching] = useTransition();
  const [{ searchResults, lastResult, emptyStateTitle, emptyStateSubtitle }, formAction] =
    useActionState(searchAction, {
      searchResults: null,
      lastResult: null,
    });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPending = isSearching || isDebouncing || isSubmitting;
  const debouncedOnChange = useMemo(() => {
    const debounced = debounce((q: string) => {
      setIsDebouncing(false);

      const formData = new FormData();

      formData.append(searchParamName, q);

      startSearching(() => {
        formAction(formData);
      });
    }, 300);

    return (q: string) => {
      setIsDebouncing(true);

      debounced(q);
    };
  }, [formAction, searchParamName]);

  const [form] = useForm({ lastResult });

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  return (
    <>
      <form
        action={searchHref}
        className="flex items-center gap-3 px-3 py-3 @4xl:px-5 @4xl:py-4"
        onSubmit={handleSubmit}
      >
        <SearchIcon
          className="hidden shrink-0 text-[var(--nav-search-icon,hsl(var(--contrast-500)))] @xl:block"
          size={20}
          strokeWidth={1}
        />
        <input
          className="grow bg-transparent pl-2 text-lg font-medium outline-0 focus-visible:outline-none @xl:pl-0"
          name={searchParamName}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            debouncedOnChange(e.currentTarget.value);
          }}
          placeholder={searchInputPlaceholder}
          type="text"
          value={query}
        />
        <SubmitButton loading={isPending} submitLabel={searchSubmitLabel} />
      </form>

      <SearchResults
        emptySearchSubtitle={emptyStateSubtitle}
        emptySearchTitle={emptyStateTitle}
        errors={form.errors}
        query={query}
        searchParamName={searchParamName}
        searchResults={searchResults}
        stale={isPending}
      />
    </>
  );
}

function SubmitButton({ loading, submitLabel }: { loading: boolean; submitLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      loading={pending || loading}
      shape="circle"
      size="small"
      type="submit"
      variant="secondary"
    >
      <ArrowRight aria-label={submitLabel} size={20} strokeWidth={1.5} />
    </Button>
  );
}

function SearchResults({
  query,
  searchResults,
  stale,
  emptySearchTitle = `No results were found for '${query}'`,
  emptySearchSubtitle = 'Please try another search.',
  errors,
}: {
  query: string;
  searchParamName: string;
  emptySearchTitle?: string;
  emptySearchSubtitle?: string;
  searchResults: SearchResult[] | null;
  stale: boolean;
  errors?: string[];
}) {
  if (query === '') return null;

  if (errors != null && errors.length > 0) {
    if (stale) return null;

    return (
      <div className="flex flex-col border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-6">
        {errors.map((error) => (
          <FormStatus key={error} type="error">
            {error}
          </FormStatus>
        ))}
      </div>
    );
  }

  if (searchResults == null || searchResults.length === 0) {
    if (stale) return null;

    return (
      <div className="flex flex-col border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-6">
        <p className="text-2xl font-medium text-[var(--nav-search-empty-title,hsl(var(--foreground)))]">
          {emptySearchTitle}
        </p>
        <p className="text-[var(--nav-search-empty-subtitle,hsl(var(--contrast-500)))]">
          {emptySearchSubtitle}
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col overflow-y-auto border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] @2xl:flex-row',
        stale && 'opacity-50',
      )}
    >
      {searchResults.map((result, index) => {
        switch (result.type) {
          case 'links': {
            return (
              <section
                aria-label={result.title}
                className="flex w-full flex-col gap-1 border-b border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-5 @2xl:max-w-80 @2xl:border-b-0 @2xl:border-r"
                key={`result-${index}`}
              >
                <h3 className="mb-4 font-[family-name:var(--nav-search-result-title-font-family,var(--font-family-mono))] text-sm uppercase text-[var(--nav-search-result-title,hsl(var(--foreground)))]">
                  {result.title}
                </h3>
                <ul role="listbox">
                  {result.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        className="block rounded-lg bg-[var(--nav-search-result-link-background,transparent)] px-3 py-4 font-[family-name:var(--nav-search-result-link-font-family,var(--font-family-body))] font-semibold text-[var(--nav-search-result-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-search-result-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-search-result-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          case 'products': {
            return (
              <section
                aria-label={result.title}
                className="flex w-full flex-col gap-5 p-5"
                key={`result-${index}`}
              >
                <h3 className="font-[family-name:var(--nav-search-result-title-font-family,var(--font-family-mono))] text-sm uppercase text-[var(--nav-search-result-title,hsl(var(--foreground)))]">
                  {result.title}
                </h3>
                <ul
                  className="grid w-full grid-cols-2 gap-5 @xl:grid-cols-4 @2xl:grid-cols-2 @4xl:grid-cols-4"
                  role="listbox"
                >
                  {result.products.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        imageSizes="(min-width: 42rem) 25vw, 50vw"
                        product={{
                          id: product.id,
                          title: product.title,
                          href: product.href,
                          price: product.price,
                          image: product.image,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

const useSwitchLocale = ({ activeLocale }: { activeLocale: Locale | undefined }) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  return useCallback(
    async (locale: string) => {
      const localizedPathname = await getLocalizedPathname({
        pathname,
        activeLocale: activeLocale?.id,
        targetLocale: locale,
      });

      // the Next.js App Router guarantees a `startTransition` call on `router.push`,
      // so we don’t need to wrap it in an explicit nested call as set out in
      // https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition
      router.push(
        {
          pathname: localizedPathname,
          // @ts-expect-error -- TypeScript will validate that only known `params`
          // are used in combination with a given `pathname`. Since the two will
          // always match for the current route, we can skip runtime checks.
          params,
          query: Object.fromEntries(searchParams.entries()),
        },
        { locale },
      );
    },
    [pathname, activeLocale?.id, params, router, searchParams],
  );
};

function LocaleSwitcher({
  locales,
  activeLocaleId,
  className,
}: {
  activeLocaleId?: string;
  locales: [Locale, ...Locale[]];
  className?: string;
}) {
  const activeLocale = locales.find((locale) => locale.id === activeLocaleId);
  const [isPending, startTransition] = useTransition();
  const switchLocale = useSwitchLocale({ activeLocale });

  return (
    <div className={className}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className={clsx(
            'flex items-center gap-1 text-xs uppercase transition-opacity disabled:opacity-30',
            navButtonClassName,
          )}
          disabled={isPending}
        >
          {activeLocale?.id ?? locales[0].id}
          <ChevronDown size={16} strokeWidth={1.5} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 max-h-80 overflow-y-scroll rounded-xl bg-[var(--nav-locale-background,hsl(var(--background)))] p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2"
            sideOffset={16}
          >
            {locales.map(({ id, label }) => (
              <DropdownMenu.Item
                className={clsx(
                  'cursor-default rounded-lg bg-[var(--nav-locale-link-background,transparent)] px-2.5 py-2 font-[family-name:var(--nav-locale-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-locale-link-text,hsl(var(--contrast-400)))] outline-none ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-locale-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-locale-link-text-hover,hsl(var(--foreground)))]',
                  {
                    'text-[var(--nav-locale-link-text-selected,hsl(var(--foreground)))]':
                      id === activeLocaleId,
                  },
                )}
                key={id}
                onSelect={() => startTransition(() => switchLocale(id))}
              >
                {label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

function CurrencyForm({
  action,
  currencies,
  activeCurrencyId,
  switchCurrencyLabel = 'Switch currency',
  className,
}: {
  activeCurrencyId?: string;
  action: CurrencyAction;
  currencies: [Currency, ...Currency[]];
  switchCurrencyLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, formAction] = useActionState(action, null);
  const activeCurrency = currencies.find((currency) => currency.id === activeCurrencyId);

  useEffect(() => {
    // eslint-disable-next-line no-console
    if (lastResult?.error) console.log(lastResult.error);
  }, [lastResult?.error]);

  return (
    <div className={className}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className={clsx(
            'flex items-center gap-1 text-xs uppercase transition-opacity disabled:opacity-30',
            navButtonClassName,
          )}
          disabled={isPending}
        >
          {activeCurrency?.label ?? currencies[0].label}
          <ChevronDown size={16} strokeWidth={1.5}>
            <title>{switchCurrencyLabel}</title>
          </ChevronDown>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 max-h-80 overflow-y-scroll rounded-xl bg-[var(--nav-locale-background,hsl(var(--background)))] p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2"
            sideOffset={16}
          >
            {currencies.map((currency) => (
              <DropdownMenu.Item
                className={clsx(
                  'cursor-default rounded-lg bg-[var(--nav-locale-link-background,transparent)] px-2.5 py-2 font-[family-name:var(--nav-locale-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-locale-link-text,hsl(var(--contrast-400)))] outline-none ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-locale-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-locale-link-text-hover,hsl(var(--foreground)))]',
                  {
                    'text-[var(--nav-locale-link-text-selected,hsl(var(--foreground)))]':
                      currency.id === activeCurrencyId,
                  },
                )}
                key={currency.id}
                onSelect={() => {
                  // eslint-disable-next-line @typescript-eslint/require-await
                  startTransition(async () => {
                    const formData = new FormData();

                    formData.append('id', currency.id);
                    formAction(formData);

                    // This is needed to refresh the Data Cache after the product has been added to the cart.
                    // The cart id is not picked up after the first time the cart is created/updated.
                    router.refresh();
                  });
                }}
              >
                {currency.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
