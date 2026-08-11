export type MeteoSnapshot = {
  label: string;
  tempC: number | null;
  windKmh: number | null;
  code: number | null;
  summary: string;
};

const CITY: Record<string, { label: string; lat: number; lon: number }> = {
  IT: { label: "Italia", lat: 41.9, lon: 12.5 },
  GB: { label: "Inghilterra", lat: 51.5, lon: -0.12 },
  ES: { label: "Spagna", lat: 40.4, lon: -3.7 },
  DE: { label: "Germania", lat: 52.52, lon: 13.4 },
  FR: { label: "Francia", lat: 48.86, lon: 2.35 },
  NL: { label: "Paesi Bassi", lat: 52.37, lon: 4.9 },
  PT: { label: "Portogallo", lat: 38.72, lon: -9.14 },
  BR: { label: "Brasile", lat: -23.55, lon: -46.63 },
};

function weatherText(code: number | null): string {
  if (code == null) return "—";
  if (code === 0) return "Sereno";
  if (code <= 3) return "Nuvoloso";
  if (code <= 48) return "Nebbia";
  if (code <= 67) return "Pioggia";
  if (code <= 77) return "Neve";
  if (code <= 82) return "Rovesci";
  if (code <= 99) return "Temporale";
  return "Variabile";
}

const cache = new Map<string, { at: number; data: MeteoSnapshot }>();
const TTL = 30 * 60 * 1000;

export async function getMeteoForCountry(
  countryCode: string,
): Promise<MeteoSnapshot | null> {
  const city = CITY[countryCode] ?? CITY.IT;
  const key = `${city.lat},${city.lon}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}` +
      `&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m` +
      `&wind_speed_unit=kmh&timezone=Europe%2FRome`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
    };
    const data: MeteoSnapshot = {
      label: city.label,
      tempC: json.current?.temperature_2m ?? null,
      windKmh: json.current?.wind_speed_10m ?? null,
      code: json.current?.weather_code ?? null,
      summary: weatherText(json.current?.weather_code ?? null),
    };
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

export async function getMeteoBundle(
  codes: string[] = ["IT", "GB", "ES", "DE"],
): Promise<MeteoSnapshot[]> {
  const unique = [...new Set(codes)];
  const rows = await Promise.all(unique.map((c) => getMeteoForCountry(c)));
  return rows.filter(Boolean) as MeteoSnapshot[];
}
