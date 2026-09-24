'use client';

import { useIsInBuilder } from '@makeswift/runtime/react';
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useState,
} from 'react';

import { HeaderSection } from '@/vibes/soul/sections/header-section';

type HeaderSectionProps = ComponentPropsWithoutRef<typeof HeaderSection>;

type NavigationProps = HeaderSectionProps['navigation'];

// MakeswiftHeader does not support streamable links
type ContextProps = Omit<HeaderSectionProps, 'navigation'> & {
  navigation: Omit<NavigationProps, 'links'> & {
    links: Awaited<NavigationProps['links']>;
  };
};

const PropsContext = createContext<ContextProps>({
  navigation: {
    giftCertificatesHref: '',
    accountHref: '',
    cartHref: '',
    searchHref: '',
    links: [],
  },
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ContextProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

interface ImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  banner: {
    id: string;
    show: boolean;
    allowClose: boolean;
    children?: ReactNode;
  };
  links: Array<{
    label: string;
    link: { href: string };
    groups: Array<{
      label: string;
      link: { href: string };
      links: Array<{
        label: string;
        link: { href: string };
      }>;
    }>;
  }>;
  logo: {
    desktop: ImageProps;
    mobile: ImageProps;
    link?: { href: string };
  };
  linksPosition: 'center' | 'left' | 'right';
}

function combineLinks(
  passedLinks: Awaited<NavigationProps['links']>,
  _links: Props['links'],
): ContextProps['navigation']['links'] {
  // The nav is fully owned by our code menu config (lib/navigation/menu-config.ts) — a single
  // source of truth. Makeswift-authored header links (`_links`) are intentionally ignored so the
  // menu can't drift or break the spaced grouping. (Re-enable the merge if editable header links
  // are ever wanted.)
  return passedLinks;
}

export const MakeswiftHeader = forwardRef(
  ({ banner, links, logo, linksPosition }: Props, ref: Ref<HTMLDivElement>) => {
    const { navigation: passedProps, banner: passedBanner } = useContext(PropsContext);
    const isInBuilder = useIsInBuilder();

    // Guard: on the live site the banner only renders when its slot actually holds something
    // (text, an image, a link…). "Show banner" ticked with an empty slot would otherwise push
    // every page down by an empty red strip. In the builder it always renders so the slot can
    // be filled. The children are mounted once in a hidden probe to inspect the DOM.
    const [hasContent, setHasContent] = useState<boolean | null>(null);
    const probeRef = useCallback((el: HTMLDivElement | null) => {
      if (!el) return;

      requestAnimationFrame(() => {
        const hasText = el.textContent.trim() !== '';
        // An empty Makeswift slot renders a dashed-outline placeholder SVG — don't count that.
        const realSvg = [...el.querySelectorAll('svg')].some(
          (svg) => svg.querySelector('rect[stroke-dasharray]') === null,
        );
        const hasMedia = el.querySelector('img, video, iframe, a, button, input') !== null;

        setHasContent(hasText || hasMedia || realSvg);
      });
    }, []);
    const bannerHasContent = isInBuilder || hasContent === true;
    const probeNeeded = banner.show && !isInBuilder && hasContent === null;

    const combinedBanner =
      banner.show && bannerHasContent
        ? {
            ...passedBanner,
            id: banner.id,
            hideDismiss: !banner.allowClose,
            children: banner.children ?? passedBanner?.children,
          }
        : undefined;

    return (
      <>
        {probeNeeded && (
          <div aria-hidden className="hidden" ref={probeRef}>
            {banner.children ?? passedBanner?.children}
          </div>
        )}
        <HeaderSection
          banner={combinedBanner}
          navigation={{
            ...passedProps,
            links: combineLinks(passedProps.links, links),
            logo: logo.desktop.src
              ? { src: logo.desktop.src, alt: logo.desktop.alt }
              : passedProps.logo,
            logoWidth: logo.desktop.width,
            logoHeight: logo.desktop.height,
            mobileLogo: logo.mobile.src
              ? { src: logo.mobile.src, alt: logo.mobile.alt }
              : passedProps.mobileLogo,
            mobileLogoWidth: logo.mobile.width,
            mobileLogoHeight: logo.mobile.height,
            linksPosition,
            logoHref: logo.link?.href ?? passedProps.logoHref,
          }}
          ref={ref}
        />
      </>
    );
  },
);
