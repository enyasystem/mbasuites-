import { useContext } from "react";
import { LocationContext } from "@/context/locationInternals";

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};

export default useLocation;
