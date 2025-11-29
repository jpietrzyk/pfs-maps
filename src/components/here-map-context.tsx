// src/components/HereMapContext.tsx
import { createContext, useContext, useRef, useState } from "react";

// Type for the context value
interface HereMapContextType {
  styleRef: React.MutableRefObject<unknown>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
}

// Create context with undefined as default value
const HereMapContext = createContext<HereMapContextType | undefined>(undefined);

interface HereMapProviderProps {
  children: React.ReactNode;
}

export const HereMapProvider: React.FC<HereMapProviderProps> = ({
  children,
}) => {
  // Holds the HERE map style object
  const styleRef = useRef<unknown>(null);

  // Tracks whether the map style is ready
  const [isReady, setIsReady] = useState<boolean>(false);

  return (
    <HereMapContext.Provider
      value={{
        styleRef,
        isReady,
        setIsReady,
      }}
    >
      {children}
    </HereMapContext.Provider>
  );
};

// Custom hook that lets any component access the HERE map and style
export const useHereMap = (): HereMapContextType => {
  const context = useContext(HereMapContext);
  if (context === undefined) {
    throw new Error("useHereMap must be used within a HereMapProvider");
  }
  return context;
};
