import React from "react";
import { SegmentHighlightContext } from "@/contexts/segment-highlight-context";

/**
 * Custom hook to use the SegmentHighlight context
 * This hook provides access to segment highlighting functionality
 */
export const useSegmentHighlight = () => {
  const context = React.useContext(SegmentHighlightContext);
  if (context === undefined) {
    throw new Error("useSegmentHighlight must be used within an SegmentHighlightProvider");
  }
  return context;
};
