'use client';

import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import { type Hours, openStatus } from '~/lib/pages/showrooms';

interface Props {
  name: string;
  hours: Hours[];
}

// The hero's eyebrow pill for a showroom: "NEW LONDON, CT" on white, turning green and reading
// "NEW LONDON | OPEN" while the showroom is open (Connecticut time, checked every minute).
export function ShowroomStatusPill({ name, hours }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setOpen(openStatus(hours).open);

    update();

    const timer = window.setInterval(update, 60_000);

    return () => window.clearInterval(timer);
  }, [hours]);

  return (
    <p
      className={clsx(
        'mb-5 inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 motion-reduce:transition-none',
        open ? 'bg-[#2bcc2b] text-black' : 'bg-white text-foreground',
      )}
    >
      {open ? (
        <>
          {name}
          <span aria-hidden className="h-3 w-px bg-black/40" />
          <span>
            <span className="sr-only">is </span>Open<span className="sr-only"> now</span>
          </span>
        </>
      ) : (
        `${name}, CT`
      )}
    </p>
  );
}
