import { Metadata } from 'next';

import { ExplainerFor, explainerMetadata } from '../_explainer/page-for';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = explainerMetadata('assembled');

// "What are assembled cabinets?" — the assembled explainer.
export default async function WhatAreAssembledCabinets({ params }: Props) {
  const { locale } = await params;

  return <ExplainerFor locale={locale} program="assembled" />;
}
