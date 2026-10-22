/**
 * Write the customer-facing "How it's built" copy for every cabinet collection and program.
 *
 * For each child of 863, each program that has a specification (content.spec_by_program) gets
 * its bullets derived by the storefront's own rules (lib/cabinets/spec-translate.ts) and stored
 * in content.how_built_by_program as plain text, one point per line, first sentence bold. Staff
 * can then edit the stored text in /cabinet-admin → Collections; the storefront shows the stored
 * text and only falls back to deriving when a program's text is blank.
 *
 *   node scripts/write-how-built.ts            # dry run: prints what would be written
 *   node scripts/write-how-built.ts --print    # dry run with the full text of every collection
 *   node scripts/write-how-built.ts --apply    # writes; keeps any program text already stored
 *   node scripts/write-how-built.ts --force    # overwrites stored text too
 *
 * Needs BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN (env or .env.local). Node 24 runs the
 * TypeScript directly.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { howItsBuilt, parseSpecLines } from '../lib/cabinets/spec-translate.ts';

const CABINETS_PARENT = 863;
const PROGRAMS = ['assembled', 'rta'] as const;

type Program = (typeof PROGRAMS)[number];

interface Metafield {
  id: number;
  namespace: string;
  key: string;
  value: string;
}

function loadEnv(): { hash: string; token: string } {
  let hash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
  let token = process.env.CATALYST_ACCESS_TOKEN ?? '';

  if (!hash || !token) {
    const envPath = path.join(import.meta.dirname, '..', '.env.local');

    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const [k, ...rest] = line.trim().split('=');
      const v = rest.join('=').replace(/^["']|["']$/g, '');

      if (k === 'BIGCOMMERCE_STORE_HASH' && !hash) hash = v;
      if (k === 'CATALYST_ACCESS_TOKEN' && !token) token = v;
    }
  }

  if (!hash || !token) throw new Error('Missing BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN.');

  return { hash, token };
}

const { hash, token } = loadEnv();
const base = `https://api.bigcommerce.com/stores/${hash}/v3`;
const headers = {
  'X-Auth-Token': token,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api<T>(method: string, route: string, body?: unknown): Promise<T> {
  const res = await fetch(base + route, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`${method} ${route} → ${res.status} ${await res.text()}`);

  const text = await res.text();

  return (text ? JSON.parse(text) : {}) as T;
}

const parse = <T>(value: string | undefined): T | undefined => {
  if (!value) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

/** The stored text format: one point per line, "Lead. Detail". */
const toText = (points: Array<{ lead: string; detail: string }>) =>
  points.map((p) => (p.detail ? `${p.lead} ${p.detail}` : p.lead)).join('\n');

async function main() {
  const apply = process.argv.includes('--apply') || process.argv.includes('--force');
  const force = process.argv.includes('--force');

  const { data: cats } = await api<{ data: Array<{ category_id: number; name: string }> }>(
    'GET',
    `/catalog/trees/categories?parent_id:in=${CABINETS_PARENT}&limit=250`,
  );

  let written = 0;

  for (const cat of cats.sort((a, b) => a.name.localeCompare(b.name))) {
    const { data: mfs } = await api<{ data: Metafield[] }>(
      'GET',
      `/catalog/categories/${cat.category_id}/metafields?limit=250`,
    );
    const find = (ns: string, key: string) => mfs.find((m) => m.namespace === ns && m.key === key);
    const specs = parse<Partial<Record<Program, string>>>(
      find('content', 'spec_by_program')?.value,
    );
    const stored = find('content', 'how_built_by_program');
    const current = parse<Partial<Record<Program, string>>>(stored?.value) ?? {};
    const next: Partial<Record<Program, string>> = {};

    for (const program of PROGRAMS) {
      const spec = specs?.[program] ?? '';
      const keep = (current[program] ?? '').trim();

      if (keep && !force) {
        next[program] = keep;
        continue;
      }

      if (!spec) continue;

      const points = howItsBuilt(parseSpecLines(spec), {
        multiFinish:
          Object.keys(parse<Record<string, unknown>>(find('finishes', 'by_finish')?.value) ?? {})
            .length > 0,
        doorStyle: parse<{ door_style?: string }>(find('merch', 'info')?.value)?.door_style,
      });

      if (points.length > 0) next[program] = toText(points);
    }

    const programs = PROGRAMS.filter((p) => next[p]);

    if (programs.length === 0) {
      console.log(`- ${cat.name}: no specifications, skipped`);
      continue;
    }

    const summary = programs
      .map(
        (p) =>
          `${p} ${next[p]?.split('\n').length ?? 0} points${current[p] && !force ? ' (kept)' : ''}`,
      )
      .join(', ');

    console.log(`${apply ? '✓' : '·'} ${cat.name}: ${summary}`);

    if (process.argv.includes('--print')) {
      for (const p of programs) console.log(`  [${p}]\n${next[p]?.replace(/^/gm, '    ')}`);
    }

    if (!apply) continue;

    const value = JSON.stringify(next);

    if (stored) {
      await api('PUT', `/catalog/categories/${cat.category_id}/metafields/${stored.id}`, { value });
    } else {
      await api('POST', `/catalog/categories/${cat.category_id}/metafields`, {
        namespace: 'content',
        key: 'how_built_by_program',
        value,
        permission_set: 'read_and_sf_access',
      });
    }

    written += 1;
  }

  console.log(apply ? `\n${written} collection(s) written.` : '\nDry run — add --apply to write.');
}

await main();
