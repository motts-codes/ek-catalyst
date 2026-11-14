// BigCommerce returns shipping options with raw carrier descriptions such as
// "Shipping (UPS® - UPS® Ground Delivers: Tue, Nov 17)", "FedEx (Ground)" or
// "Express Kitchens Truck Delivery (EK Truck)". This turns each into a short label plus an
// optional detail line ("Delivers Tue, Nov 17") for the cart's shipping options list.

export interface ShippingOptionText {
  label: string;
  detail?: string;
}

const DELIVERS = /\s*Delivers:\s*(.+)$/i;

function tidy(text: string): string {
  return text.replace(/[®™]/g, '').replace(/\s+/g, ' ').trim();
}

// "UPS - UPS Ground" → "UPS Ground"; "FedEx - Express Saver" → "FedEx Express Saver".
function joinCarrierAndService(inner: string): string {
  const [carrier, ...rest] = inner.split(' - ').map(tidy);
  const service = rest.join(' - ');

  if (!carrier) return service;
  if (!service) return carrier;

  return service.toLowerCase().startsWith(carrier.toLowerCase())
    ? service
    : `${carrier} ${service}`;
}

// Drop a parenthetical that only repeats the name ("(EK Truck)" after "Express Kitchens Truck
// Delivery"); otherwise fold it into the label ("FedEx (Ground)" → "FedEx Ground").
function foldParenthetical(name: string, extra: string): string {
  const nameWords = new Set(tidy(name).toLowerCase().split(' '));
  const redundant = tidy(extra)
    .split(' ')
    .every((word) => nameWords.has(word.toLowerCase()) || /^[A-Z]{1,3}$/.test(word));

  return redundant ? tidy(name) : `${tidy(name)} ${tidy(extra)}`;
}

export function describeShippingOption(description: string): ShippingOptionText {
  let text = tidy(description);
  let detail: string | undefined;

  const delivers = DELIVERS.exec(text);

  if (delivers?.[1]) {
    detail = `Delivers ${tidy(delivers[1]).replace(/\)+$/, '')}`;
    text = text.replace(DELIVERS, text.endsWith(')') ? ')' : '');
  }

  // "Pickup (Collect from - 18 Main Street, Bristol, CT 06010)" → "Pickup" + the address.
  const pickup = /^(Pickup\b[^(]*?)\s*\(?\s*Collect from\s*-?\s*(.+?)\)?$/i.exec(text);

  if (pickup?.[1] && pickup[2]) {
    return { label: tidy(pickup[1]), detail: `Collect from ${tidy(pickup[2])}` };
  }

  const wrapped = /^Shipping \((.+)\)$/i.exec(text);

  if (wrapped?.[1]) {
    return { label: joinCarrierAndService(wrapped[1]), detail };
  }

  const withExtra = /^(.+?)\s*\((.+)\)$/.exec(text);

  if (withExtra?.[1] && withExtra[2]) {
    return { label: foldParenthetical(withExtra[1], withExtra[2]), detail };
  }

  return { label: text, detail };
}
