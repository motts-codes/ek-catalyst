'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export interface AccordionStep {
  title: string;
  description: string;
}

interface Props {
  steps: AccordionStep[];
  /** The heading level under which the step titles sit. */
  headingLevel?: 3 | 4;
}

// Numbered steps as a stack of boxes: only the headline shows until a step is tapped, then its
// short description opens beneath (one open at a time). Used beside the measuring diagram.
export function StepsAccordion({ steps, headingLevel = 3 }: Props) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3';

  return (
    <AccordionPrimitive.Root className="grid gap-3" collapsible type="single">
      {steps.map((step, i) => (
        <AccordionPrimitive.Item
          className="rounded-2xl border border-contrast-100 bg-white transition-colors data-[state=open]:border-contrast-200"
          key={step.title}
          value={step.title}
        >
          <AccordionPrimitive.Header asChild>
            <Heading className="m-0">
              <AccordionPrimitive.Trigger className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] font-heading text-sm font-bold text-white"
                >
                  {i + 1}
                </span>
                <span className="flex-1 font-heading text-base font-semibold leading-tight">
                  {step.title}
                </span>
                <ChevronDown
                  aria-hidden
                  className="shrink-0 text-contrast-400 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180"
                  size={18}
                />
              </AccordionPrimitive.Trigger>
            </Heading>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
            <p className="px-5 pb-4 pl-[4.25rem] text-sm leading-relaxed text-contrast-500">
              {step.description}
            </p>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
