import type {
  PriorityFilterState,
  StatusFilterState,
  AmountFilterState,
  ComplexityFilterState,
  UpdatedAtFilterState,
} from "@/components/delivery-route/order-filters";

import React, { createContext, useContext, useState, useMemo } from "react";

export type MapFiltersState = {
  priorityFilters: PriorityFilterState;
  statusFilters: StatusFilterState;
  amountFilters: AmountFilterState;
  complexityFilters: ComplexityFilterState;
  updatedAtFilters: UpdatedAtFilterState;
};

const defaultFilters: MapFiltersState = {
  priorityFilters: { low: true, medium: true, high: true },
  statusFilters: {
    pending: true,
    "in-progress": true,
    completed: true,
    cancelled: true,
  },
  amountFilters: { low: true, medium: true, high: true },
  complexityFilters: { simple: true, moderate: true, complex: true },
  updatedAtFilters: { recent: true, moderate: true, old: true },
};

interface MapFiltersContextType {
  filters: MapFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<MapFiltersState>>;
}

const MapFiltersContext = createContext<MapFiltersContextType | undefined>(
  undefined,
);

export const MapFiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<MapFiltersState>(defaultFilters);

  const value = useMemo(() => ({ filters, setFilters }), [filters]);

  return (
    <MapFiltersContext.Provider value={value}>
      {children}
    </MapFiltersContext.Provider>
  );
};

export const useMapFilters = (): MapFiltersContextType => {
  const context = useContext(MapFiltersContext);
  if (!context) {
    throw new Error("useMapFilters must be used within a MapFiltersProvider");
  }
  return context;
};
