import { z } from 'zod';

export const schema = ({
  requiredMessage,
  invalidMessage,
}: {
  requiredMessage: string;
  invalidMessage: string;
}) =>
  z.object({
    email: z.string({ required_error: requiredMessage }).email({ message: invalidMessage }),
  });
