'use client';

import { ShowroomBand } from '@/vibes/soul/sections/showroom-band';
import { SHOWROOMS } from '~/lib/home/home-content';

interface ShowroomItem {
  name: string;
  badge: string;
  link?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
}

interface Props {
  className: string;
  kicker: string;
  title: string;
  description: string;
  showrooms: ShowroomItem[];
  interval: number;
  tint: boolean;
}

export function MSShowroomBand({
  className,
  kicker,
  title,
  description,
  showrooms,
  interval,
  tint,
}: Props) {
  return (
    <ShowroomBand
      className={className}
      description={description}
      interval={interval * 1000}
      kicker={kicker}
      showrooms={
        showrooms.length > 0
          ? showrooms.map(({ name, badge, link, imageSrc, imageAlt }) => ({
              name,
              badge: badge || undefined,
              href: link?.href ?? '#',
              image: imageSrc ? { src: imageSrc, alt: imageAlt || `${name} showroom` } : undefined,
            }))
          : SHOWROOMS
      }
      tint={tint}
      title={title}
    />
  );
}
