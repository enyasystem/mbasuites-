// Type definition for LocationData (inlined to avoid import issues in edge functions)
export interface LocationData {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;
  price_per_night_usd?: number | null;
  is_active: boolean;
}

export interface LocationHierarchy {
  [country: string]: {
    [city: string]: LocationData[];
  };
}

/**
 * Organizes locations into a hierarchical structure: Country > City > Locations
 */
export function buildLocationHierarchy(locations: LocationData[]): LocationHierarchy {
  return locations.reduce((hierarchy, location) => {
    const country = location.country;
    const city = location.city;

    if (!hierarchy[country]) {
      hierarchy[country] = {};
    }

    if (!hierarchy[country][city]) {
      hierarchy[country][city] = [];
    }

    hierarchy[country][city].push(location);
    return hierarchy;
  }, {} as LocationHierarchy);
}

/**
 * Gets sorted list of countries from locations
 */
export function getCountries(locations: LocationData[]): string[] {
  const countries = new Set(locations.map((loc) => loc.country));
  return Array.from(countries).sort();
}

/**
 * Gets sorted list of cities for a given country
 */
export function getCitiesByCountry(
  locations: LocationData[],
  country: string
): string[] {
  const cities = new Set(
    locations
      .filter((loc) => loc.country === country)
      .map((loc) => loc.city)
  );
  return Array.from(cities).sort();
}

/**
 * Gets locations for a given country and city
 */
export function getLocationsByCityAndCountry(
  locations: LocationData[],
  country: string,
  city: string
): LocationData[] {
  return locations
    .filter((loc) => loc.country === country && loc.city === city)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Formats location display name as "Location Name - City"
 */
export function formatLocationName(location: LocationData): string {
  return `${location.name}${location.city ? ` - ${location.city}` : ""}`;
}
