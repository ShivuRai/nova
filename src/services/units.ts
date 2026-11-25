export type UnitType = 'length' | 'weight' | 'temp' | 'data' | 'currency';

export const unitsConfig: Record<UnitType, { units: string[]; convert: (val: number, from: string, to: string) => number }> = {
  length: {
    units: ['meter', 'kilometer', 'centimeter', 'mile', 'foot', 'inch'],
    convert: (val, from, to) => {
      const inMeters: Record<string, number> = {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        mile: 1609.34,
        foot: 0.3048,
        inch: 0.0254,
      };
      const meters = val * (inMeters[from] || 1);
      return meters / (inMeters[to] || 1);
    },
  },
  weight: {
    units: ['kilogram', 'gram', 'pound', 'ounce', 'ton'],
    convert: (val, from, to) => {
      const inGrams: Record<string, number> = {
        kilogram: 1000,
        gram: 1,
        pound: 453.592,
        ounce: 28.3495,
        ton: 1000000,
      };
      const grams = val * (inGrams[from] || 1);
      return grams / (inGrams[to] || 1);
    },
  },
  temp: {
    units: ['celsius', 'fahrenheit', 'kelvin'],
    convert: (val, from, to) => {
      let c = val;
      if (from === 'fahrenheit') c = (val - 32) * (5 / 9);
      else if (from === 'kelvin') c = val - 273.15;

      if (to === 'fahrenheit') return c * (9 / 5) + 32;
      if (to === 'kelvin') return c + 273.15;
      return c;
    },
  },
  data: {
    units: ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'],
    convert: (val, from, to) => {
      const inBytes: Record<string, number> = {
        byte: 1,
        kilobyte: 1024,
        megabyte: 1024 * 1024,
        gigabyte: 1024 * 1024 * 1024,
        terabyte: 1024 * 1024 * 1024 * 1024,
      };
      const b = val * (inBytes[from] || 1);
      return b / (inBytes[to] || 1);
    },
  },
  currency: {
    units: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'],
    convert: (val, from, to) => {
      const inUsd: Record<string, number> = {
        USD: 1,
        EUR: 1.08,
        GBP: 1.28,
        INR: 0.012,
        JPY: 0.0065,
        CAD: 0.72,
      };
      const usd = val * (inUsd[from] || 1);
      return usd / (inUsd[to] || 1);
    },
  },
};

 
const abbreviations: Record<string, string> = {
  m: 'meter', km: 'kilometer', cm: 'centimeter', mi: 'mile', ft: 'foot', in: 'inch',
  kg: 'kilogram', g: 'gram', lb: 'pound', oz: 'ounce', c: 'celsius', f: 'fahrenheit', k: 'kelvin',
  kb: 'kilobyte', mb: 'megabyte', gb: 'gigabyte', tb: 'terabyte',
};

export function convertText(text: string): string | null {
  const parts = text.trim().toLowerCase().match(/^(-?\d+(?:\.\d+)?)\s*([a-z]+)\s+(?:to|in)\s+([a-z]+)$/);
  if (!parts) return null;
  const normalize = (unit: string) => abbreviations[unit] || (/^[a-z]{3}$/.test(unit) && unitsConfig.currency.units.includes(unit.toUpperCase())
    ? unit.toUpperCase() : unit.replace(/s$/, ''));
  const from = normalize(parts[2]);
  const to = normalize(parts[3]);
  const category = Object.entries(unitsConfig).find(([, config]) => config.units.includes(from) && config.units.includes(to));
  if (!category) return null;
  const converted = category[1].convert(Number(parts[1]), from, to);
  return converted.toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' ' + to + (category[0] === 'currency' ? ' (estimate)' : '');
}
