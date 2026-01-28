import { useContext } from "react";
import { MapFiltersContext, type MapFiltersContextType } from "../contexts/map-filters-context-types";

export const useMapFilters = (): MapFiltersContextType => {
  const context = useContext(MapFiltersContext);
  if (!context) {
    throw new Error("useMapFilters must be used within a MapFiltersProvider");
  }
  return context;
};
