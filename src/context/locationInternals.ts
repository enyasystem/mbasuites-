import { createContext } from "react";
import { LocationContextType } from "@/types/location";

// Internal shared context object — kept in its own file so that files
// exporting components (providers) don't also export non-component symbols
export const LocationContext = createContext<LocationContextType | undefined>(undefined);
