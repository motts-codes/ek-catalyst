'use client';

import { SiFacebook, SiPinterest, SiX } from '@icons-pack/react-simple-icons';
import { Mail, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  title: string;
  /** The post's photo, used as the Pinterest pin image. */
  imageSrc?: string;
  className?: string;
}

// Neither icon set ships the LinkedIn mark any more (brand-icon policy), so it is drawn here.
function LinkedInIcon() {
  return (
    <svg aria-hidden fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const BUTTON_CLASS =
  'flex h-9 w-9 items-center justify-center rounded-full border border-contrast-200 text-contrast-500 transition-colors duration-300 ease-out hover:border-foreground hover:text-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary [&_svg]:h-4 [&_svg]:w-4';

// Share buttons under "On this page": the social networks in the footer's round-button style
// (simple-icons), plus email and print (Lucide). The share URLs need the page's address, which
// is only known in the browser, so they fill in after mount; the buttons render disabled until
// then rather than linking to nothing.
export function ShareRow({ title, imageSrc, className }: Props) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const absoluteImage =
    imageSrc && url ? encodeURIComponent(new URL(imageSrc, url).toString()) : '';

  const links = [
    {
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <SiFacebook aria-hidden />,
    },
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <SiX aria-hidden />,
    },
    {
      label: 'Pin on Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${absoluteImage ? `&media=${absoluteImage}` : ''}`,
      icon: <SiPinterest aria-hidden />,
    },
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <LinkedInIcon />,
    },
    {
      label: 'Share by email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A${encodedUrl}`,
      icon: <Mail aria-hidden strokeWidth={1.75} />,
    },
  ];

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-contrast-500">Share</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              aria-disabled={url === '' ? true : undefined}
              aria-label={link.label}
              className={BUTTON_CLASS}
              href={url === '' ? undefined : link.href}
              rel="noopener noreferrer"
              target="_blank"
              title={link.label}
            >
              {link.icon}
            </a>
          </li>
        ))}
        <li>
          <button
            aria-label="Print this article"
            className={BUTTON_CLASS}
            onClick={() => window.print()}
            title="Print this article"
            type="button"
          >
            <Printer aria-hidden strokeWidth={1.75} />
          </button>
        </li>
      </ul>
    </div>
  );
}
