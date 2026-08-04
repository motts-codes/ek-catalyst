import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'RTA Kitchen Cabinets',
  description:
    'Ready-to-assemble (RTA) cabinets in a range of door styles and finishes at a lower price point.',
};

// RTA (ready-to-assemble) cabinet lines landing page — same view as the Assembled page, driven by
// the child categories' BigCommerce metafields for the RTA program.
export default async function RtaCabinets({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const lines = await getCabinetLines('rta');

  return (
    <CabinetLines
      description="Ready-to-assemble cabinets in a range of door styles and finishes — the same quality and soft-close hardware, shipped flat at a lower price point."
      lines={lines}
      program="rta"
      title="RTA Kitchen Cabinets"
    />
  );
}
