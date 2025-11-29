// src/contexts/HereMapContext.tsx
import { createContext } from "react";
import type { HereMap } from "@/types/here-maps";

// Type for the context value
export interface HereMapContextType {
  styleRef: React.MutableRefObject<unknown>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  mapRef: React.MutableRefObject<HereMap | null>;
}

// Create context with undefined as default value
export const HereMapContext = createContext<HereMapContextType | undefined>(
  undefined
);
