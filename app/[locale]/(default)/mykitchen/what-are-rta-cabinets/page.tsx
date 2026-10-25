import { Metadata } from 'next';

import { ExplainerFor, explainerMetadata } from '../_explainer/page-for';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = explainerMetadata('rta');

// "What are RTA cabinets?" — the ready-to-assemble explainer.
export default async function WhatAreRtaCabinets({ params }: Props) {
  const { locale } = await params;

  return <ExplainerFor locale={locale} program="rta" />;
}
