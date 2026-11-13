import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const AccountGreetingQuery = graphql(`
  query AccountGreetingQuery {
    customer {
      firstName
      email
    }
  }
`);

// Just enough of the signed-in customer for the "Welcome back, Arun" line in the account sidebar.
export const getAccountGreeting = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: AccountGreetingQuery,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    customerAccessToken,
  });

  const customer = response.data.customer;

  if (!customer) return null;

  return { firstName: customer.firstName.trim(), email: customer.email };
});
