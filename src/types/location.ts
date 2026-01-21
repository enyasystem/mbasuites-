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

export interface LocationContextType {
  locationId: string | null;
  setLocationId: (id: string | null) => void;
  locations: LocationData[];
  isLoading: boolean;
  selectedLocation: LocationData | null;
}
