import { clsx } from 'clsx';
import { Search } from 'lucide-react';

import { Actions, type PageAction } from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';

interface Props {
  kicker?: string;
  title: string;
  description: string;
  image: { src: string; alt: string };
  search: { action: string; name: string; placeholder: string; label: string };
  /** The two or three places most visitors were heading, as buttons under the search. */
  actions: PageAction[];
  /** The quiet last line ("Still stuck? Call or text…"); phone numbers become tel: links. */
  note: string;
  className?: string;
}

const RED = 'text-[var(--button-primary-background,#d90716)]';

// The 404, one centred column: the eyebrow line, a big "404", a line of copy, the empty-cabinet
// photo, a search box, the buttons, and a last line with the phone number. Plain GET form, so the
// search works without JavaScript and lands on the search page with the term in the URL.
export function EkNotFound({
  kicker = '404',
  title,
  description,
  image,
  search,
  actions,
  note,
  className,
}: Props) {
  return (
    // Its own container: this page renders outside the layout's, so the @-breakpoints need one.
    <section className={clsx('@container', className)}>
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12 text-center @xl:px-9 @4xl:py-16">
        <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${RED}`}>{kicker}</p>
        <h1 className="font-heading text-5xl font-bold leading-none @xl:text-6xl @4xl:text-7xl">
          {title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-contrast-500">{description}</p>

        <div className="mt-8 w-full max-w-xs @3xl:max-w-lg">
          <Image
            alt={image.alt}
            className="h-auto w-full"
            height={750}
            preload
            sizes="(min-width: 56rem) 32rem, 20rem"
            src={image.src}
            width={1200}
          />
        </div>

        <form action={search.action} className="mt-8 w-full max-w-xl" method="get" role="search">
          <label className="sr-only" htmlFor="not-found-search">
            {search.label}
          </label>
          <div className="flex items-center rounded-full border border-contrast-200 bg-white pl-5 pr-1.5 text-start transition-colors focus-within:border-foreground">
            <Search aria-hidden className="shrink-0 text-contrast-400" size={18} />
            <input
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-base text-foreground placeholder:text-contrast-400 focus:outline-none"
              id="not-found-search"
              name={search.name}
              placeholder={search.placeholder}
              type="search"
            />
            <button
              className="shrink-0 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--button-primary-background,#d90716)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
              type="submit"
            >
              {search.label}
            </button>
          </div>
        </form>

        <Actions actions={actions} className="mt-6 justify-center" />

        <p className="mt-8 text-sm text-contrast-500">
          <NoteWithPhone text={note} />
        </p>
      </div>
    </section>
  );
}

// Turns a phone number in the note into a tap-to-call link; the rest of the sentence stays text.
function NoteWithPhone({ text }: { text: string }) {
  const match = /\d{3}-\d{3}-\d{4}/.exec(text);

  if (!match) return text;

  const [phone] = match;
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + phone.length);

  return (
    <>
      {before}
      <a
        className="font-semibold text-foreground underline-offset-4 hover:underline"
        href={`tel:${phone.replace(/-/g, '')}`}
      >
        {phone}
      </a>
      {after}
    </>
  );
}
