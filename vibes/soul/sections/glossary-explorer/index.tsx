'use client';

import { clsx } from 'clsx';
import { Check, Link2, Minus, Plus, Search, X } from 'lucide-react';
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';

import { type GlossaryGroup, termId } from '~/lib/pages/cabinet-glossary';

interface Props {
  groups: GlossaryGroup[];
  className?: string;
}

const RED = 'text-[var(--button-primary-background,#d90716)]';

// The glossary as an explorer. A sticky bar under the hero holds a live search and a pill per
// group (the pill of the group in view is lit as you scroll). Each group is an accordion row;
// the first opens by default, and a search opens every group with a match and highlights the
// matched text. Every term is an anchor (#undermount-glides) with a copy-link button, and a
// term arrived at by link glows blush for a moment so the eye finds it.
export function GlossaryExplorer({ groups, className }: Props) {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(groups[0] ? [groups[0].id] : []),
  );
  const [activeId, setActiveId] = useState(groups[0]?.id ?? '');
  const searchId = useId();

  // A–Z inside each group, and, while searching, only the groups and terms that match.
  const visible = useMemo(() => {
    const sorted = groups.map((group) => ({
      ...group,
      terms: [...group.terms].sort((a, b) =>
        a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }),
      ),
    }));

    if (deferred === '') return sorted;

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
  }, [groups, deferred]);

  const total = visible.reduce((n, group) => n + group.terms.length, 0);
  const searching = deferred !== '';

  // Opening the term that a #anchor points at, on arrival and when the hash changes.
  useEffect(() => {
    const openHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));

      if (!id) return;

      const owner = groups.find(
        (group) => group.id === id || group.terms.some((entry) => termId(entry.term) === id),
      );

      if (owner) setOpenIds((current) => new Set(current).add(owner.id));
    };

    openHash();
    window.addEventListener('hashchange', openHash);

    return () => window.removeEventListener('hashchange', openHash);
  }, [groups]);

  // Scroll-spy: the pill for the group nearest the top of the viewport is lit.
  useEffect(() => {
    const headings = groups
      .map((group) => document.getElementById(group.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: '-120px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [groups, visible]);

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const jump = (id: string) => {
    setOpenIds((current) => new Set(current).add(id));
    setActiveId(id);
  };

  return (
    <div className={clsx('@container', className)}>
      {/* The bar: search on the left, the group pills scrolling on the right. It sticks under the
          site header. */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-contrast-100 bg-white/95 px-6 py-3 backdrop-blur @xl:-mx-9 @xl:px-9 @4xl:-mx-14 @4xl:px-14">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 @3xl:flex-row @3xl:items-center">
          <div className="relative shrink-0 @3xl:w-72">
            <label className="sr-only" htmlFor={searchId}>
              Search the glossary
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-contrast-400"
              size={16}
            />
            <input
              autoComplete="off"
              className="h-10 w-full rounded-full border border-contrast-200 bg-white pl-10 pr-10 text-sm text-foreground placeholder:text-contrast-400 focus:border-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a term…"
              type="search"
              value={query}
            />
            {query !== '' && (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-contrast-500 hover:bg-contrast-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]"
                onClick={() => setQuery('')}
                type="button"
              >
                <X size={14} strokeWidth={2.25} />
              </button>
            )}
          </div>
          <nav aria-label="Glossary sections" className="min-w-0 flex-1">
            <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visible.map((group) => {
                const on = group.id === activeId && !searching;

                return (
                  <li className="shrink-0" key={group.id}>
                    <a
                      aria-current={on ? 'location' : undefined}
                      className={clsx(
                        'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2',
                        on
                          ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
                          : 'border-contrast-200 bg-white text-foreground hover:border-foreground',
                      )}
                      href={`#${group.id}`}
                      onClick={() => jump(group.id)}
                    >
                      {group.title}
                      <span
                        className={clsx(
                          'rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums',
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
        </div>
      </div>

      {/* Live status for the search. */}
      <p aria-live="polite" className="mt-6 text-sm text-contrast-500">
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
        <div className="mt-4 divide-y divide-contrast-100 border-y border-contrast-100">
          {visible.map((group) => (
            <GroupRow
              group={group}
              highlight={deferred}
              key={group.id}
              onToggle={() => toggle(group.id)}
              open={searching || openIds.has(group.id)}
            />
          ))}
        </div>
      )}
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
    <section className="scroll-mt-28" id={group.id}>
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
          {/* + closed, − open: the same expand / collapse sign as the FAQ rows elsewhere, rather
              than a rotated + that reads as "close". */}
          <span
            aria-hidden
            className={clsx(
              // A quarter smaller on phones (21px ring, 12px glyph); the full 28px ring from tablet up.
              'flex size-[21px] shrink-0 items-center justify-center rounded-full border transition-colors @md:size-7',
              open
                ? 'border-[var(--button-primary-background,#d90716)] text-[var(--button-primary-background,#d90716)]'
                : 'border-contrast-200 text-contrast-500 group-hover:border-[var(--button-primary-background,#d90716)] group-hover:text-[var(--button-primary-background,#d90716)]',
            )}
          >
            {open ? (
              <Minus className="size-3 @md:size-4" strokeWidth={2.25} />
            ) : (
              <Plus className="size-3 @md:size-4" strokeWidth={2.25} />
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
          <dl className="grid gap-x-12 pb-8 @3xl:grid-cols-2">
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
