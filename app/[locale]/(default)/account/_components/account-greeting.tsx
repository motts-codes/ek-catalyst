import { getTranslations } from 'next-intl/server';

import { getAccountGreeting } from '../page-data';

// "Welcome back, Arun" plus the signed-in email, above the account menu. First name only: a
// surname would need a title we do not collect. No first name on file → just "Welcome back".
export async function AccountGreeting() {
  const [customer, t] = await Promise.all([
    getAccountGreeting(),
    getTranslations('Account.Layout'),
  ]);

  if (!customer) return null;

  return (
    <div className="mb-5 border-b border-contrast-100 px-3 pb-5">
      <p className="font-heading text-xl font-semibold leading-tight">
        {customer.firstName ? t('welcome', { firstName: customer.firstName }) : t('welcomeNoName')}
      </p>
      <p className="mt-1 truncate text-xs text-contrast-500" title={customer.email}>
        {t('signedInAs', { email: customer.email })}
      </p>
    </div>
  );
}
