import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

interface Props {
  kicker?: string;
  title: string;
  description: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  image?: { src: string; alt: string };
  imageLabel?: string;
  imagePosition?: 'left' | 'right';
  tint?: boolean;
  className?: string;
}

// One brand-story band: text on one side (kicker, title, paragraph, buttons), a photo on the
// other. "Made in Connecticut. In stock in Connecticut."
export function StoryBand({
  kicker,
  title,
  description,
  actions = [],
  image,
  imageLabel,
  imagePosition = 'right',
  tint = false,
  className,
}: Props) {
  return (
    <HomeSection className={className} tint={tint}>
      <div className="grid items-center gap-8 @3xl:grid-cols-[1.4fr_1fr] @3xl:gap-12">
        <div className={clsx(imagePosition === 'left' && '@3xl:order-2')}>
          {Boolean(kicker) && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-contrast-400">
              {kicker}
            </p>
          )}
          <h2 className="font-heading text-2xl font-medium leading-tight @xl:text-3xl @4xl:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {description}
          </p>
          {actions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {actions.map((action) => (
                <ButtonLink
                  href={action.href}
                  key={action.label}
                  shape="pill"
                  size="small"
                  variant={action.primary ? 'primary' : 'secondary'}
                >
                  {action.label}
                </ButtonLink>
              ))}
            </div>
          )}
        </div>
        <div
          className={clsx(
            'relative aspect-[4/3] overflow-hidden rounded-2xl bg-contrast-100',
            imagePosition === 'left' && '@3xl:order-1',
          )}
        >
          {image ? (
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 40vw, 100vw"
              src={image.src}
            />
          ) : (
            <MediaPlaceholder label={imageLabel ?? title} />
          )}
        </div>
      </div>
    </HomeSection>
  );
}
