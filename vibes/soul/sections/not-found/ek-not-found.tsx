import { clsx } from 'clsx';
import { ArrowRight, type LucideIcon, Search } from 'lucide-react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface NotFoundLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface Props {
  kicker?: string;
  title: string;
  description: string;
  links: NotFoundLink[];
  search: { action: string; name: string; placeholder: string; label: string };
  /** The quiet last line ("Still stuck? Call or text…"); phone numbers become tel: links. */
  note: string;
  image: { src: string; alt: string };
  className?: string;
}

const RED = 'text-[var(--button-primary-background,#d90716)]';

// The 404: copy, the four places most visitors were heading, a search box and a last line on the
// left; the empty-cabinet photo, kept small, on the right. Plain GET form, so it works without
// JavaScript and lands on the search page with the term in the URL.
export function EkNotFound({
  kicker = '404',
  title,
  description,
  links,
  search,
  note,
  image,
  className,
}: Props) {
  return (
    // Its own container: this page renders outside the layout's, so the @-breakpoints need one.
    <section className={clsx('@container', className)}>
      <div className="mx-auto grid max-w-screen-2xl items-center gap-10 px-6 py-12 @xl:px-9 @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @3xl:gap-16 @4xl:px-14 @4xl:py-20">
        <div className="max-w-xl">
          <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${RED}`}>{kicker}</p>
          <h1 className="font-heading text-3xl font-bold leading-tight @xl:text-4xl @4xl:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-contrast-500 @xl:text-lg">
            {description}
          </p>

          <ul className="mt-8 divide-y divide-contrast-100 border-y border-contrast-100">
            {links.map(({ title: linkTitle, description: linkDescription, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  className="group flex items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
                  href={href}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdf3f5]">
                    <Icon aria-hidden className={RED} size={18} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-base font-semibold leading-tight transition-colors group-hover:text-[var(--button-primary-background,#d90716)]">
                      {linkTitle}
                    </span>
                    <span className="mt-0.5 block text-sm text-contrast-500">
                      {linkDescription}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className={`shrink-0 transition-transform group-hover:translate-x-1 ${RED}`}
                    size={18}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <form action={search.action} className="mt-8" method="get" role="search">
            <label className="sr-only" htmlFor="not-found-search">
              {search.label}
            </label>
            <div className="flex items-center rounded-full border border-contrast-200 bg-white pl-5 pr-1.5 transition-colors focus-within:border-foreground">
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

          <p className="mt-6 text-sm text-contrast-500">
            <NoteWithPhone text={note} />
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm @3xl:max-w-md">
          <Image
            alt={image.alt}
            className="h-auto w-full"
            height={750}
            preload
            sizes="(min-width: 56rem) 28rem, 24rem"
            src={image.src}
            width={1200}
          />
        </div>
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
