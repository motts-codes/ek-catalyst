import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';

const toNumber = (price?: string) => Number((price ?? '').replace(/[^0-9.]/g, ''));

// The lowest live 10×10 price per program, formatted for copy ("from $2,800"). Null when the
// catalog is unreachable, so a page can fall back to "[X]" rather than show $0.
export async function getLowest10x10() {
  const [assembled, rta] = await Promise.all([
    getCabinetLines('assembled'),
    getCabinetLines('rta'),
  ]);
  const lowest = (prices: number[]) => {
    const valid = prices.filter((p) => p > 0);

    return valid.length > 0 ? `$${Math.round(Math.min(...valid)).toLocaleString('en-US')}` : null;
  };

  return {
    assembled: lowest(assembled.map((l) => toNumber(l.price))),
    rta: lowest(rta.map((l) => toNumber(l.price))),
    collections: assembled.length,
  };
}
