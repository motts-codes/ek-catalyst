import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Assembled Kitchen Cabinets',
  description:
    'Premium, ready-to-install assembled cabinets in a range of door styles and finishes.',
};

// Assembled cabinet lines landing page. A card per cabinet line/finish (Avon, Dover, …), driven by
// the child categories' BigCommerce metafields (pricing_10x10 / fulfillment / sample) for the
// Assembled program. The RTA sibling page (../rta-cabinets) is the same view with program="rta".
export default async function AssembledCabinets({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const lines = await getCabinetLines('assembled');

  return (
    <CabinetLines
      description="Premium, ready-to-install cabinets in a range of door styles and finishes — soft-close doors and drawers, customizable storage, and quality materials, in both framed and frameless designs."
      lines={lines}
      program="assembled"
      title="Assembled Kitchen Cabinets"
    />
  );
}
