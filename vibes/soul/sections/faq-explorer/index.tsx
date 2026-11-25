'use client';

import { clsx } from 'clsx';
import {
  Check,
  CreditCard,
  Hammer,
  Layers,
  Link2,
  type LucideIcon,
  Minus,
  PackageOpen,
  PencilRuler,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Store,
  Truck,
  X,
} from 'lucide-react';
import {
  type ReactNode,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type CabinetFaqItem } from '@/vibes/soul/sections/cabinet-faq';
import { Link } from '~/components/link';
import { type FaqGroup, type FaqIcon } from '~/lib/pages/faq';

const ICONS: Record<FaqIcon, LucideIcon> = {
  'pencil-ruler': PencilRuler,
  'package-open': PackageOpen,
  layers: Layers,
  'credit-card': CreditCard,
  truck: Truck,
  hammer: Hammer,
  'rotate-ccw': RotateCcw,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  store: Store,
};

const RED = 'text-[var(--button-primary-background,#d90716)]';

// Anchor id for a question: "Do you install?" -> "do-you-install".
function questionId(question: string): string {
  return question
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

// The FAQ as an explorer: a table of contents on the left (one row per topic, with its icon and
// count, the topic in view lit red as you scroll), and on the right a live search and the topics
// as accordion groups with every question its own anchor and copy-link button. On phones the
// contents become a scrolling row of pills above the questions.
export function FaqExplorer({ groups, className }: { groups: FaqGroup[]; className?: string }) {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query.trim().toLowerCase());
  // One topic open at a time (the first by default); opening another closes the previous one.
  const [openId, setOpenId] = useState<string | null>(groups[0]?.id ?? null);
  const [activeId, setActiveId] = useState(groups[0]?.id ?? '');
  const searchId = useId();
  const searching = deferred !== '';

  const visible = useMemo(() => {
    if (!searching) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.q.toLowerCase().includes(deferred) || item.a.toLowerCase().includes(deferred),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, deferred, searching]);

  const total = visible.reduce((n, group) => n + group.items.length, 0);

  // A #anchor (a topic or a question) opens its topic on arrival and whenever the hash changes.
  useEffect(() => {
    const openHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));

      if (!id) return;

      const owner = groups.find(
        (group) => group.id === id || group.items.some((item) => questionId(item.q) === id),
      );

      if (owner) setOpenId(owner.id);
    };

    openHash();
    window.addEventListener('hashchange', openHash);

    return () => window.removeEventListener('hashchange', openHash);
  }, [groups]);

  // Scroll-spy for the contents.
  useEffect(() => {
    const sections = groups
      .map((group) => document.getElementById(group.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: '-100px 0px -65% 0px', threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [groups, visible]);

  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  const jump = (id: string) => {
    setOpenId(id);
    setActiveId(id);
  };

  return (
    <div
      className={clsx('grid gap-10 @container @3xl:grid-cols-[17rem_1fr] @3xl:gap-14', className)}
    >
      {/* Contents: a column on desktop that sticks while you scroll; a pill row on phones. */}
      <nav aria-label="FAQ topics" className="min-w-0 @3xl:sticky @3xl:top-6 @3xl:self-start">
        <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wide text-contrast-500 @3xl:block">
          Topics
        </p>
        <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] @3xl:mx-0 @3xl:flex-col @3xl:gap-1 @3xl:overflow-visible @3xl:px-0 @3xl:pb-0 [&::-webkit-scrollbar]:hidden">
          {groups.map((group) => {
            const Icon = ICONS[group.icon];
            const on = group.id === activeId && !searching;
            const dimmed = searching && !visible.some((v) => v.id === group.id);

            return (
              <li className="shrink-0" key={group.id}>
                <a
                  aria-current={on ? 'location' : undefined}
                  className={clsx(
                    'group/topic flex items-center gap-2.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 @3xl:rounded-xl @3xl:border-transparent @3xl:px-3 @3xl:py-2.5',
                    on
                      ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white @3xl:bg-[#fdf3f5] @3xl:text-[var(--button-primary-background,#d90716)]'
                      : 'border-contrast-200 bg-white text-foreground hover:border-[#fcb6bb] hover:bg-[#fdf3f5] @3xl:hover:border-transparent',
                    dimmed && 'opacity-40',
                  )}
                  href={`#${group.id}`}
                  onClick={() => jump(group.id)}
                >
                  <Icon
                    aria-hidden
                    className={clsx(
                      'shrink-0',
                      on ? 'text-current' : 'text-[var(--button-primary-background,#d90716)]',
                    )}
                    size={18}
                    strokeWidth={1.75}
                  />
                  <span className="flex-1">{group.title}</span>
                  <span
                    className={clsx(
                      'hidden rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums @3xl:inline',
                      on
                        ? 'bg-white text-[var(--button-primary-background,#d90716)]'
                        : 'bg-contrast-100 text-contrast-500',
                    )}
                  >
                    {group.items.length}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">
        {/* Search, with a live count beneath. */}
        <div className="relative">
          <label className="sr-only" htmlFor={searchId}>
            Search the questions
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-contrast-400"
            size={18}
          />
          <input
            autoComplete="off"
            className="h-12 w-full rounded-full border border-contrast-200 bg-white pl-12 pr-12 text-base text-foreground placeholder:text-contrast-400 focus:border-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
            id={searchId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a question, like “damaged” or “pick up”…"
            type="search"
            value={query}
          />
          {query !== '' && (
            <button
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-contrast-500 hover:bg-contrast-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]"
              onClick={() => setQuery('')}
              type="button"
            >
              <X size={15} strokeWidth={2.25} />
            </button>
          )}
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-contrast-500">
          {searching
            ? `${total} ${total === 1 ? 'answer' : 'answers'} match “${query.trim()}”`
            : `${total} questions in ${groups.length} topics`}
        </p>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-contrast-100 bg-[#fdf8f8] px-6 py-10 text-center">
            <p className="font-heading text-lg font-semibold">Nothing matches that.</p>
            <p className="mt-2 text-sm text-contrast-500">
              Try a shorter word, or clear the search and browse the topics. If it still isn’t here,
              call or text 860-247-1000.
            </p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-contrast-100 border-y border-contrast-100">
            {visible.map((group) => (
              <TopicRow
                group={group}
                highlight={deferred}
                key={group.id}
                onToggle={() => toggle(group.id)}
                open={searching || openId === group.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// One topic: a heading button that opens its questions beneath.
function TopicRow({
  group,
  open,
  onToggle,
  highlight,
}: {
  group: FaqGroup;
  open: boolean;
  onToggle: () => void;
  highlight: string;
}) {
  const Icon = ICONS[group.icon];
  const panelId = `${group.id}-questions`;

  return (
    <section className="scroll-mt-6" id={group.id}>
      <h2>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className={clsx(
            'group flex w-full items-center gap-3 py-5 text-left font-heading text-xl font-bold leading-tight transition-colors hover:text-[var(--button-primary-background,#d90716)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 @xl:text-2xl',
            open && RED,
          )}
          onClick={onToggle}
          type="button"
        >
          <Icon aria-hidden className={clsx('shrink-0', RED)} size={22} strokeWidth={1.75} />
          <span className="flex-1">{group.title}</span>
          {/* + closed, − open: the same expand / collapse sign as the FAQ rows elsewhere, rather
              than a rotated + that reads as "close". */}
          <span
            aria-hidden
            className={clsx(
              // Small on phones (16px ring, 9px glyph, per Arun); the full 28px ring from tablet up.
              'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors @md:size-7',
              open
                ? 'border-[var(--button-primary-background,#d90716)] text-[var(--button-primary-background,#d90716)]'
                : 'border-contrast-200 text-contrast-500 group-hover:border-[var(--button-primary-background,#d90716)] group-hover:text-[var(--button-primary-background,#d90716)]',
            )}
          >
            {open ? (
              <Minus className="size-[9px] @md:size-4" strokeWidth={2.25} />
            ) : (
              <Plus className="size-[9px] @md:size-4" strokeWidth={2.25} />
            )}
          </span>
        </button>
      </h2>
      <div
        className={clsx(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
        id={panelId}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-contrast-100 pb-6 pl-0 @xl:pl-[34px]">
            {group.items.map((item) => (
              <QuestionRow highlight={highlight} item={item} key={item.q} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// One question: the question in bold, the answer beneath with its inline links, and a copy-link
// button on hover or focus. The row glows blush when it is the page's #anchor.
function QuestionRow({ item, highlight }: { item: CabinetFaqItem; highlight: string }) {
  const id = questionId(item.q);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.hash = id;
    }
  };

  return (
    <div
      className="group/q relative scroll-mt-6 py-4 pr-10 transition-colors duration-700 target:-mx-4 target:rounded-xl target:bg-[#fdf3f5] target:px-4 target:ring-1 target:ring-[#fcb6bb]"
      id={id}
    >
      <h3 className="font-heading text-base font-semibold leading-snug @xl:text-lg">
        <Mark highlight={highlight} text={item.q} />
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-contrast-500 @xl:text-base">
        <Answer highlight={highlight} text={item.a} />
        <button
          aria-label={copied ? `Link to “${item.q}” copied` : `Copy link to “${item.q}”`}
          className={clsx(
            'absolute right-0 top-4 flex size-7 items-center justify-center rounded-full border transition-[opacity,color,border-color] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]',
            copied
              ? 'border-[var(--button-primary-background,#d90716)] text-[var(--button-primary-background,#d90716)] opacity-100'
              : 'border-contrast-200 text-contrast-500 opacity-0 hover:border-foreground hover:text-foreground group-hover/q:opacity-100',
          )}
          onClick={copy}
          type="button"
        >
          {copied ? <Check size={13} strokeWidth={2.5} /> : <Link2 size={13} strokeWidth={2} />}
        </button>
      </p>
    </div>
  );
}

// An answer with its `[label](href)` links as red links.
function Answer({ text, highlight }: { text: string; highlight: string }) {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > last) {
      parts.push(
        <Mark highlight={highlight} key={`t${last}`} text={text.slice(last, match.index)} />,
      );
    }

    const href = match[2] ?? '#';
    const label = match[1] ?? href;

    parts.push(
      <Link
        className={clsx('font-semibold underline underline-offset-4 hover:no-underline', RED)}
        href={href}
        key={`l${match.index}`}
      >
        {label}
      </Link>,
    );

    last = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (last < text.length) {
    parts.push(<Mark highlight={highlight} key={`t${last}`} text={text.slice(last)} />);
  }

  return parts;
}

// Highlights the searched text.
function Mark({ text, highlight }: { text: string; highlight: string }) {
  if (highlight === '') return text;

  const index = text.toLowerCase().indexOf(highlight);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-[#C0EDF6] px-0.5 text-foreground">
        {text.slice(index, index + highlight.length)}
      </mark>
      {text.slice(index + highlight.length)}
    </>
  );
}
