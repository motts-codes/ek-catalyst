// EK's GreenSky financing plans, from EK's financing policy (Arun's brief of 27 Oct 2026). The
// monthly example is amount × the plan's payment factor, as the policy sets it out. The
// estimator's monthly figure uses Plan 1519 (see lib/estimator/ten-by-ten-prices.ts).

export interface FinancingPlan {
  /** GreenSky plan number. */
  plan: string;
  title: string;
  what: string;
  /** Monthly payment as a share of the amount financed (e.g. 0.0132 = 1.32%). */
  factor: number;
  /** Qualifies the example ("after the promo" for the deferred plan). */
  qualifier?: string;
}

export const FINANCING_PLANS: FinancingPlan[] = [
  {
    plan: '2739',
    title: 'Fixed rate, 10 years',
    what: '9.99% APR for 120 months. The same payment every month.',
    factor: 0.0132,
  },
  {
    plan: '1519',
    title: 'Fixed rate, 15 years',
    what: '11.99% APR for 180 months. The lowest monthly payment.',
    factor: 0.012,
  },
  {
    plan: '4129',
    title: '12 months, interest waived',
    what: 'Pay in full within 12 months and the interest is waived. 108 monthly payments at 9.99% APR, starting right away.',
    factor: 0.0141,
  },
  {
    plan: '2531',
    title: '18 months, no payments',
    what: 'No payments for 18 months, and the interest is waived if you pay in full in that time. After that, 84 monthly payments at 15.08–23.07% APR.',
    factor: 0.0242,
    qualifier: 'after the promo',
  },
];

/** The kitchen price the page's monthly examples are worked on. */
export const FINANCING_EXAMPLE_AMOUNT = 10_000;

// "about $132/month" for a plan on an amount.
export function monthlyExample(plan: FinancingPlan, amount = FINANCING_EXAMPLE_AMOUNT): string {
  const monthly = Math.round(amount * plan.factor);
  const base = `About $${monthly.toLocaleString('en-US')}/month`;

  return plan.qualifier ? `${base} ${plan.qualifier}` : base;
}
