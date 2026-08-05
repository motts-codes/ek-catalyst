import { SectionLayout } from '@/vibes/soul/sections/section-layout';

export interface CabinetAssemblyVideo {
  name: string;
  /** Original YouTube URL as authored in the admin. */
  url: string;
  /** Parsed YouTube video id (null when the URL isn't a recognizable YouTube link). */
  youtubeId: string | null;
}

interface Props {
  videos: CabinetAssemblyVideo[];
  className?: string;
}

/**
 * Assembly-instruction videos for a cabinet collection (name + YouTube link, authored per
 * collection). Renders nothing when there are no videos.
 */
export function CabinetAssembly({ videos, className }: Props) {
  const usable = videos.filter((v) => v.name.trim() !== '' || v.url.trim() !== '');

  if (usable.length === 0) return null;

  return (
    <SectionLayout className={className} containerSize="2xl">
      <h2 className="mb-6 font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
        Assembly Instructions
      </h2>

      <div className="grid grid-cols-1 gap-8 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {usable.map((v, i) => (
          <div key={i}>
            {v.youtubeId ? (
              <div className="relative aspect-video overflow-hidden rounded-xl bg-contrast-100">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full"
                  loading="lazy"
                  src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                  title={v.name || `Assembly video ${i + 1}`}
                />
              </div>
            ) : (
              // Unrecognized URL — link out rather than embed.
              <a
                className="flex aspect-video items-center justify-center rounded-xl bg-contrast-100 text-sm font-medium text-[#2162a1] hover:underline"
                href={v.url}
                rel="noreferrer"
                target="_blank"
              >
                Watch video →
              </a>
            )}
            {v.name.trim() !== '' && (
              <p className="mt-2 text-sm font-medium text-foreground">{v.name}</p>
            )}
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}
