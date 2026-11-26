'use client';

import { clsx } from 'clsx';
import { Check, Link2, Search, X } from 'lucide-react';
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';

import { PlusMinus } from '@/vibes/soul/primitives/plus-minus';
import { type GlossaryGroup, termId } from '~/lib/pages/cabinet-glossary';

interface Props {
  groups: GlossaryGroup[];
  className?: string;
}

const RED = 'text-[var(--button-primary-background,#d90716)]';

// The glossary as an explorer, laid out like the FAQ: a table of contents on the left (one row
// per group with its count, every group visible at once, the group in view lit as you scroll),
// and on the right a live search and the groups as accordion rows. One group is open at a time
// (the first by default); opening another closes it. A search opens every group with a match and
// highlights the matched text. Every term is an anchor (#undermount-glides) with a copy-link
// button, and a term arrived at by link glows blush for a moment. On phones the contents become
// a scrolling row of pills above the terms.
export function GlossaryExplorer({ groups, className }: Props) {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const [openId, setOpenId] = useState<string | null>(groups[0]?.id ?? null);
  const [activeId, setActiveId] = useState(groups[0]?.id ?? '');
  const searchId = useId();
  const searching = deferred !== '';

  // A–Z inside each group, and, while searching, only the groups and terms that match.
  const visible = useMemo(() => {
    const sorted = groups.map((group) => ({
      ...group,
      terms: [...group.terms].sort((a, b) =>
        a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }),
      ),
    }));

    if (!searching) return sorted;

    return sorted
      .map((group) => ({
        ...group,
        terms: group.terms.filter(
          (entry) =>
            entry.term.toLowerCase().includes(deferred) ||
            entry.definition.toLowerCase().includes(deferred),
        ),
      }))
      .filter((group) => group.terms.length > 0);
  }, [groups, deferred, searching]);

  const total = visible.reduce((n, group) => n + group.terms.length, 0);

  // A #anchor (a group or a term) opens its group on arrival and whenever the hash changes.
  useEffect(() => {
    const openHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));

      if (!id) return;

      const owner = groups.find(
        (group) => group.id === id || group.terms.some((entry) => termId(entry.term) === id),
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
      <nav aria-label="Glossary groups" className="min-w-0 @3xl:sticky @3xl:top-6 @3xl:self-start">
        <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wide text-contrast-500 @3xl:block">
          Groups
        </p>
        <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] @3xl:mx-0 @3xl:flex-col @3xl:gap-1 @3xl:overflow-visible @3xl:px-0 @3xl:pb-0 [&::-webkit-scrollbar]:hidden">
          {groups.map((group) => {
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
                  <span className="flex-1">{group.title}</span>
                  <span
                    className={clsx(
                      'hidden rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums @3xl:inline',
                      on
                        ? 'bg-white text-[var(--button-primary-background,#d90716)]'
                        : 'bg-contrast-100 text-contrast-500',
                    )}
                  >
                    {group.terms.length}
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
            Search the glossary
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
            placeholder="Search a term, like “toe kick” or “soft close”…"
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
            ? `${total} ${total === 1 ? 'term' : 'terms'} match “${query.trim()}”`
            : `${total} terms in ${groups.length} groups`}
        </p>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-contrast-100 bg-[#fdf8f8] px-6 py-10 text-center">
            <p className="font-heading text-lg font-semibold">No term matches that.</p>
            <p className="mt-2 text-sm text-contrast-500">
              Try a shorter word, or clear the search and browse the groups.
            </p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-contrast-100 border-y border-contrast-100">
            {visible.map((group) => (
              <GroupRow
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

// One group: a heading button that opens the A–Z list beneath it.
function GroupRow({
  group,
  open,
  onToggle,
  highlight,
}: {
  group: GlossaryGroup;
  open: boolean;
  onToggle: () => void;
  highlight: string;
}) {
  const panelId = `${group.id}-terms`;

  return (
    <section className="scroll-mt-6" id={group.id}>
      <h2>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className={clsx(
            'group flex w-full items-center justify-between gap-4 py-5 text-left font-heading text-xl font-bold leading-tight transition-colors hover:text-[var(--button-primary-background,#d90716)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 @xl:text-2xl',
            open && RED,
          )}
          onClick={onToggle}
          type="button"
        >
          <span>
            {group.title}
            <span className="ml-3 align-middle font-body text-xs font-semibold text-contrast-400">
              {group.terms.length}
            </span>
          </span>
          {/* + closed, − open (bare sign, no ring): shared with every other FAQ toggle. */}
          <PlusMinus open={open} size="lg" />
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
          <dl className="grid gap-x-12 pb-8 @4xl:grid-cols-2">
            {group.terms.map((entry) => (
              <TermRow
                definition={entry.definition}
                highlight={highlight}
                key={entry.term}
                term={entry.term}
              />
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

// One term: bold term, the definition, and a copy-link button that appears on hover or focus.
// The row glows blush when it is the page's #anchor.
function TermRow({
  term,
  definition,
  highlight,
}: {
  term: string;
  definition: string;
  highlight: string;
}) {
  const id = termId(term);
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
      className="group/term relative scroll-mt-32 rounded-xl py-3 pr-10 transition-colors duration-700 target:bg-[#fdf3f5] target:px-4 target:ring-1 target:ring-[#fcb6bb]"
      id={id}
    >
      <dt className="font-heading text-base font-semibold leading-snug">
        <Mark highlight={highlight} text={term} />
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-contrast-500">
        <Mark highlight={highlight} text={definition} />
        <button
          aria-label={copied ? `Link to “${term}” copied` : `Copy link to “${term}”`}
          className={clsx(
            'absolute right-0 top-3 flex size-7 items-center justify-center rounded-full border transition-[opacity,color,border-color] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]',
            copied
              ? 'border-[var(--button-primary-background,#d90716)] text-[var(--button-primary-background,#d90716)] opacity-100'
              : 'border-contrast-200 text-contrast-500 opacity-0 hover:border-foreground hover:text-foreground group-hover/term:opacity-100',
          )}
          onClick={copy}
          type="button"
        >
          {copied ? <Check size={13} strokeWidth={2.5} /> : <Link2 size={13} strokeWidth={2} />}
        </button>
      </dd>
    </div>
  );
}

// Highlights the searched text inside a term or definition.
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
