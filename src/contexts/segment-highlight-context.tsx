import { createContext } from "react";

export type SegmentHighlightContextType = {
  highlightedSegmentId: string | null;
  setHighlightedSegmentId: (id: string | null) => void;
};

export const SegmentHighlightContext = createContext<
  SegmentHighlightContextType | undefined
>(undefined);
