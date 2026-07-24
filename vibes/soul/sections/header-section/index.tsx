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

    return (
      <div ref={ref}>
        {banner && <Banner ref={setBannerElement} {...banner} />}
        {/* Thin utility strip — sits above the sticky nav and scrolls away with the page. */}
        <UtilityBar mode={navigation.audienceMode} />
        <Headroom
          onUnfix={() => setIsFloating(false)}
          onUnpin={() => setIsFloating(true)}
          pinStart={bannerHeight}
        >
          <div className="p-2 pb-0">
            <Navigation {...navigation} isFloating={isFloating} />
          </div>
          {/* Mobile-only action row below the nav (the CTA + toggle are hidden in the main nav row
              below 1400px). Spread edge-to-edge: Free Design Consult · toggle · Call us. Hidden at
              >=1050px where the desktop nav has room for these. */}
          <MobileActionRow
            audienceToggle={navigation.audienceToggle}
            ctaButton={navigation.ctaButton}
          />
        </Headroom>
      </div>
    );
  },
);

HeaderSection.displayName = 'HeaderSection';

// Mobile-only row below the nav: Free Design Consult · toggle, spread edge-to-edge. Shown below
// 1050px, where the CTA + toggle don't fit in the main nav row. (Call lives in the utility bar.)
function MobileActionRow({
  ctaButton,
  audienceToggle,
}: {
  ctaButton?: React.ReactNode;
  audienceToggle?: React.ReactNode;
}) {
  if (ctaButton == null && audienceToggle == null) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-contrast-100 px-4 py-2 min-[1050px]:hidden">
      {ctaButton}
      {audienceToggle}
    </div>
  );
}
