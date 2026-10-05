import { MakeswiftComponent } from '@makeswift/runtime/next';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import { type SectionDefaults, SectionDefaultsProvider } from './section-defaults';

interface Props {
  /** Unique per placement — the builder stores this section's edits under it. */
  snapshotId: string;
  /** Name shown in the builder when the section is selected. */
  label: string;
  /** Registered Makeswift component type (see section-types.ts). */
  type: string;
  /** Content shown until the section is edited in the builder. */
  defaults: SectionDefaults;
}

// Mounts ONE registered Makeswift component directly on a code page (the same mechanism as the
// site header/footer). In the builder, clicking the section selects that component and its
// controls appear straight away — no slot, no "Use fallback" toggle, nothing to drag in. Until it
// is edited, it renders the page's `defaults`.
export async function EditableSection({ snapshotId, label, type, defaults }: Props) {
  const snapshot = await getComponentSnapshot(snapshotId);

  return (
    <SectionDefaultsProvider value={defaults}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={type} />
    </SectionDefaultsProvider>
  );
}
