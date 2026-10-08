'use client';

import { forwardRef, useEffect, useState } from 'react';
import Headroom from 'react-headroom';

import { Banner } from '@/vibes/soul/primitives/banner';
import { Navigation } from '@/vibes/soul/primitives/navigation';

import { UtilityBar } from './utility-bar';

interface Props {
  navigation: React.ComponentPropsWithoutRef<typeof Navigation>;
  banner?: React.ComponentPropsWithoutRef<typeof Banner>;
}

export const HeaderSection = forwardRef<React.ComponentRef<'div'>, Props>(
  ({ navigation, banner }, ref) => {
    const [bannerElement, setBannerElement] = useState<HTMLElement | null>(null);
    const [bannerHeight, setBannerHeight] = useState(0);
    const [isFloating, setIsFloating] = useState(false);

    useEffect(() => {
      if (!bannerElement) return;

      const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of entries) {
          setBannerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(bannerElement);

      return () => {
        resizeObserver.disconnect();
      };
    }, [bannerElement]);

    // The Homeowner/Pro switch lives in the utility strip (per the wireframe), not the nav row —
    // pull it out of the navigation props so the Navigation primitive doesn't render it too.
    const { audienceToggle, ...navigationProps } = navigation;

    return (
      // `@container` so the width classes below resolve exactly like the page sections do — the
      // utility strip and the nav card share the hero's container: max-w-screen-2xl with the same
      // responsive side padding (px-4 / @xl:px-6 / @4xl:px-8).
      <div className="@container" ref={ref}>
        {banner && <Banner ref={setBannerElement} {...banner} />}
        {/* Thin utility strip — sits above the sticky nav and scrolls away with the page. */}
        <UtilityBar audienceToggle={audienceToggle} mode={navigation.audienceMode} />
        <Headroom
          onUnfix={() => setIsFloating(false)}
          onUnpin={() => setIsFloating(true)}
          pinStart={bannerHeight}
          // Headroom's wrapper is a stacking context at z-index 1, which let positioned page
          // content (the hero's slide dots) show through the open mega menu. Lift the whole header.
          style={{ zIndex: 40 }}
        >
          <div className="mx-auto max-w-screen-2xl px-4 pt-1 @xl:px-6 @4xl:px-8">
            {/* On narrow screens the CTA moves into the mobile menu (first row) — no extra row
                under the nav. Call + the audience switch live in the utility bar. */}
            <Navigation {...navigationProps} isFloating={isFloating} />
          </div>
        </Headroom>
      </div>
    );
  },
);

HeaderSection.displayName = 'HeaderSection';
