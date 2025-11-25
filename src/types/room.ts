export interface Room {
  id: string;
  name: string;
  type: "single" | "double" | "king" | "queen" | "suite" | "presidential";
  category: "standard" | "deluxe" | "executive" | "presidential";
  price: number;
  size: number; // in sq meters
  capacity: {
    adults: number;
    children: number;
  };
  bedType: string;
  amenities: string[];
  images: string[];
  description: string;
  rating: number;
  available: boolean;
}

export interface RoomFilters {
  priceRange: [number, number];
  bedTypes: string[];
  minSize: number;
  amenities: string[];
  categories: string[];
  sortBy: "price-asc" | "price-desc" | "rating-desc" | "size-desc";
}
