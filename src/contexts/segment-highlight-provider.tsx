import React, { useState } from "react";
import { SegmentHighlightContext } from "./segment-highlight-context";

export default function SegmentHighlightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<
    string | null
  >(null);

  return (
    <SegmentHighlightContext.Provider
      value={{ highlightedSegmentId, setHighlightedSegmentId }}
    >
      {children}
    </SegmentHighlightContext.Provider>
  );
}
