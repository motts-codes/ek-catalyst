import { MessageSquareQuote, PencilRuler, Truck } from 'lucide-react';

// Delivery/pickup line from the __delivery custom field, with a Lucide icon in brand red chosen
// from the wording: made-to-measure ("Custom order") gets the pencil-and-ruler, a quote line the
// speech bubble, everything else the truck.
export function DeliveryLine({ message }: { message?: string }) {
  if (message == null || message === '') return null;

  const Icon = pickIcon(message);

  return (
    <span className="mt-1.5 flex items-center gap-1.5 text-xs text-foreground">
      <Icon
        aria-hidden
        className="shrink-0 text-[var(--button-primary-background,#d90716)]"
        size={16}
        strokeWidth={1.5}
      />
      {message}
    </span>
  );
}

function pickIcon(message: string) {
  if (/custom|made to (measure|order)/i.test(message)) return PencilRuler;
  if (/quote/i.test(message)) return MessageSquareQuote;

  return Truck;
}
