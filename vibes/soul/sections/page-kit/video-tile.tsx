'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';

import { Modal } from '@/vibes/soul/primitives/modal';
import { Image } from '~/components/image';
import type { Video } from '~/lib/pages/projects';

// A YouTube video as a tile: its thumbnail with a red play mark (white ring), the title and meta beneath. Clicking
// opens the video in a dialog (privacy-enhanced embed, autoplaying) rather than leaving the page.
export function VideoTile({ video }: { video: Video & { youtubeId: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="group block w-full text-left focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="relative block aspect-video overflow-hidden rounded-2xl bg-contrast-100">
          <Image
            alt=""
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 64rem) 33vw, (min-width: 36rem) 50vw, 100vw"
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
            unoptimized
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white bg-[var(--button-primary-background,#d90716)] text-white shadow-md transition-transform group-hover:scale-110">
              <Play aria-hidden className="ml-0.5" fill="currentColor" size={20} strokeWidth={2} />
            </span>
          </span>
          {video.duration ? (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {video.duration}
            </span>
          ) : null}
        </span>
        <span className="mt-2.5 block text-sm font-semibold leading-snug">{video.title}</span>
        {video.meta ? (
          <span className="mt-0.5 block text-xs text-contrast-500">{video.meta}</span>
        ) : null}
      </button>
      <Modal
        className="w-full max-w-5xl [&>div>div:last-child]:!m-0 [&>div>div:last-child]:!p-0"
        hideHeader
        isOpen={open}
        setOpen={setOpen}
        title={video.title}
      >
        {open ? (
          <div className="aspect-video w-full bg-black">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
            />
          </div>
        ) : null}
      </Modal>
    </>
  );
}
