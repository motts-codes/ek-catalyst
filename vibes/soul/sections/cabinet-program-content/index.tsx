import { clsx } from 'clsx';
import {
  Archive,
  Award,
  BadgeCheck,
  BadgeDollarSign,
  Blocks,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Crown,
  DoorOpen,
  Layers,
  LayoutGrid,
  type LucideIcon,
  MoveHorizontal,
  Palette,
  PencilRuler,
  Percent,
  Shield,
  ShieldCheck,
  Sparkles,
  Square,
  Truck,
  VolumeX,
  Wallet,
  Warehouse,
} from 'lucide-react';

const ICONS = {
  archive: Archive,
  award: Award,
  'badge-check': BadgeCheck,
  'badge-dollar-sign': BadgeDollarSign,
  blocks: Blocks,
  bot: Bot,
  'check-check': CheckCheck,
  clock: Clock,
  crown: Crown,
  'door-open': DoorOpen,
  layers: Layers,
  'layout-grid': LayoutGrid,
  'move-horizontal': MoveHorizontal,
  palette: Palette,
  'pencil-ruler': PencilRuler,
  percent: Percent,
  shield: Shield,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  square: Square,
  truck: Truck,
  'volume-x': VolumeX,
  wallet: Wallet,
  warehouse: Warehouse,
} satisfies Record<string, LucideIcon>;

export type ContentIcon = keyof typeof ICONS;

export interface CabinetProgramContent {
  styles: {
    title: string;
    intro: string;
    lines: Array<{ name: string; construction: string; summary: string }>;
    looksTitle: string;
    looks: Array<{ icon: ContentIcon; name: string; summary: string }>;
    outro: string;
  };
  build: {
    title: string;
    points: Array<{ icon: ContentIcon; lead: string; detail: string }>;
  };
  why: {
    title: string;
    intro: string;
    reasons: Array<{
      icon: ContentIcon;
      title: string;
      note?: string;
      detail: string;
      /** Bento placement: a tall card spans two rows (for the longest copy). */
      span?: 'tall';
    }>;
  };
  choose: {
    title: string;
    intro: string;
    rows: Array<{ icon: ContentIcon; factor: string; advice: string }>;
  };
  program: {
    title: string;
    intro: string;
    points: Array<{ lead: string; detail: string }>;
  };
}

const CONTAINER = 'mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14';
const H2 =
  'font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl';
const COPY = 'text-sm leading-relaxed text-contrast-500 @xl:text-base';

function IconBadge({ icon, className }: { icon: ContentIcon; className?: string }) {
  const Icon = ICONS[icon];

  return (
    <span
      className={clsx(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f9fafd] text-[var(--button-primary-background,#d90716)] ring-1 ring-contrast-100',
        className,
      )}
    >
      <Icon size={17} strokeWidth={1.75} />
    </span>
  );
}

// The long-form content at the foot of a program listing, in the site's own blocks: a table of
// the lines, look tiles, an icon grid for build quality, reason cards, a how-to-choose table and
// a check list — rather than one long run of headings and bullets.
export function CabinetProgramContentSection({
  content,
  className,
}: {
  content: CabinetProgramContent;
  className?: string;
}) {
  const { styles, build, why, choose, program } = content;

  return (
    <div className={clsx('@container', className)}>
      {/* 1. Styles: the lines as a table, the looks as tiles. */}
      <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
        <h2 className={H2}>{styles.title}</h2>
        <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{styles.intro}</p>
        <div className="mt-6 grid gap-8 @3xl:grid-cols-[3fr_2fr] @3xl:gap-12">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-contrast-200 text-left text-xs uppercase tracking-wide text-contrast-500">
                <th className="py-2 pr-4 font-semibold" scope="col">
                  Line
                </th>
                <th className="py-2 pr-4 font-semibold" scope="col">
                  Construction
                </th>
                <th className="py-2 font-semibold" scope="col">
                  Best for
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-contrast-100">
              {styles.lines.map((line) => (
                <tr className="align-top" key={line.name}>
                  <th className="py-3 pr-4 text-left font-semibold text-foreground" scope="row">
                    {line.name}
                  </th>
                  <td className="py-3 pr-4 text-contrast-500">{line.construction}</td>
                  <td className="py-3 text-contrast-500">{line.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h3 className="font-[family-name:var(--font-family-heading)] text-base font-semibold">
              {styles.looksTitle}
            </h3>
            <ul className="mt-3 flex flex-col gap-3">
              {styles.looks.map((look) => (
                <li className="flex items-start gap-3" key={look.name}>
                  <IconBadge icon={look.icon} />
                  <p className="text-sm leading-relaxed text-contrast-500">
                    <span className="font-semibold text-foreground">{look.name}: </span>
                    {look.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={clsx(COPY, 'mt-6 max-w-3xl')}>{styles.outro}</p>
      </section>

      {/* 2. Build quality: an icon grid on the grey band. */}
      <section className="bg-[#f9fafd] py-12 @4xl:py-16">
        <div className={CONTAINER}>
          <h2 className={H2}>{build.title}</h2>
          <ul className="mt-6 grid gap-x-8 gap-y-6 @xl:grid-cols-2 @4xl:grid-cols-3">
            {build.points.map((point) => (
              <li className="flex items-start gap-3" key={point.lead}>
                <IconBadge className="bg-white" icon={point.icon} />
                <p className="text-sm leading-relaxed text-contrast-500">
                  <span className="font-semibold text-foreground">{point.lead} </span>
                  {point.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Why Express Kitchens: reason cards. */}
      <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
        <h2 className={H2}>{why.title}</h2>
        <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{why.intro}</p>
        {/* Bento grid: three columns, the tall card spanning two rows so eight cards fill nine
            cells. Hover turns a card brand red with white text and icon. */}
        <ul className="mt-6 grid grid-flow-dense gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
          {why.reasons.map((reason) => {
            const Icon = ICONS[reason.icon];

            return (
              <li
                className={clsx(
                  'group flex flex-col gap-4 rounded-2xl border border-contrast-100 bg-white p-6 transition-colors duration-300 ease-smooth hover:border-[var(--button-primary-background,#d90716)] hover:bg-[var(--button-primary-background,#d90716)] hover:text-white',
                  reason.span === 'tall' && '@xl:row-span-2',
                )}
                key={reason.title}
              >
                <Icon
                  className="text-[var(--button-primary-background,#d90716)] transition-colors duration-300 group-hover:text-white"
                  size={32}
                  strokeWidth={1.5}
                />
                <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-semibold leading-snug">
                  {reason.title}
                  {reason.note != null && (
                    <span className="mt-0.5 block text-xs font-normal text-contrast-400 transition-colors duration-300 group-hover:text-white/80">
                      {reason.note}
                    </span>
                  )}
                </h3>
                <p className="text-sm leading-relaxed text-contrast-500 transition-colors duration-300 group-hover:text-white/90">
                  {reason.detail}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 4. How to choose: a factor / advice table. */}
      <section className="bg-[#f9fafd] py-12 @4xl:py-16">
        <div className={CONTAINER}>
          <h2 className={H2}>{choose.title}</h2>
          <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{choose.intro}</p>
          <table className="mt-6 w-full border-collapse overflow-hidden rounded-2xl bg-white text-sm ring-1 ring-contrast-100">
            <tbody className="divide-y divide-contrast-100">
              {choose.rows.map((row) => (
                <tr className="align-top" key={row.factor}>
                  <th className="w-[38%] px-4 py-3 text-left @xl:w-[26%] @xl:px-5" scope="row">
                    <span className="flex items-center gap-3 font-semibold text-foreground">
                      <IconBadge icon={row.icon} />
                      {row.factor}
                    </span>
                  </th>
                  <td className="px-4 py-3 text-contrast-500 @xl:px-5 @xl:py-4">{row.advice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Why this program: a check list. */}
      <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
        <h2 className={H2}>{program.title}</h2>
        <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{program.intro}</p>
        <ul className="mt-6 grid gap-x-8 gap-y-4 @xl:grid-cols-2 @4xl:grid-cols-3">
          {program.points.map((point) => (
            <li className="flex items-start gap-2.5" key={point.lead}>
              <Check
                className="mt-0.5 shrink-0 text-[var(--button-primary-background,#d90716)]"
                size={18}
                strokeWidth={2.25}
              />
              <p className="text-sm leading-relaxed text-contrast-500">
                <span className="font-semibold text-foreground">{point.lead} </span>
                {point.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
