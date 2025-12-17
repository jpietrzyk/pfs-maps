import React from "react";
import type { RouteSegment } from "@/types/map-provider";
import type { RouteManager } from "@/services/RouteManager";

interface DeliveryDriveSegmentProps {
  segment: RouteSegment;
  onRecalculate?: () => void;
  isCalculating?: boolean;
  onHover?: () => void;
  routeManager?: RouteManager;
}

export const DeliveryDriveSegment: React.FC<DeliveryDriveSegmentProps> = ({
  segment,
  onRecalculate,
  isCalculating = false,
  onHover,
  routeManager,
}) => {
  const handleRecalculate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRecalculate?.();
  };

  const handleMouseEnter = () => {
    onHover?.();
    if (routeManager) {
      routeManager.highlightSegment(segment.id);
    }
  };

  const handleMouseLeave = () => {
    if (routeManager) {
      routeManager.unhighlightSegment(segment.id);
    }
  };

  // Format duration from seconds to minutes
  const formatDuration = (seconds: number): string => {
    return Math.round(seconds / 60).toString();
  };

  // Format distance from meters to kilometers
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(1);
  };

  // Format location coordinates for display
  const formatLocation = (lat: number, lng: number): string => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  return (
    <li
      key={`segment-${segment.id}`}
      className={`flex items-center justify-center text-xs py-1 transition-colors duration-200 ${
        routeManager && segment.mapRoute
          ? "hover:bg-accent/50 cursor-pointer"
          : "text-muted-foreground/80"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isCalculating ? (
        <span className="animate-pulse flex items-center gap-1">
          <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
          Calculating route...
        </span>
      ) : segment.routeData ? (
        <div className="flex items-center gap-2">
          <div className="text-xs">
            <div className="font-medium text-foreground/90">
              Route: {segment.fromOrder.customer} → {segment.toOrder.customer}
            </div>
            <div className="text-muted-foreground/80">
              Start:{" "}
              {formatLocation(
                segment.fromOrder.location.lat,
                segment.fromOrder.location.lng
              )}
            </div>
            <div className="text-muted-foreground/80">
              End:{" "}
              {formatLocation(
                segment.toOrder.location.lat,
                segment.toOrder.location.lng
              )}
            </div>
            <div className="text-muted-foreground/80">
              Distance: {formatDistance(segment.routeData.distance)}km | Time:{" "}
              {formatDuration(segment.routeData.duration)}min
            </div>
          </div>
          {segment.status === "failed" && (
            <span className="text-red-500 ml-2" title={segment.routeData.error}>
              ⚠️
            </span>
          )}
          <button
            onClick={handleRecalculate}
            className="text-blue-500 hover:text-blue-600 transition-colors"
            title="Recalculate route"
          >
            ⭯
          </button>
        </div>
      ) : (
        <span className="text-yellow-500 flex items-center gap-1">
          <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
          Route not calculated
        </span>
      )}
    </li>
  );
};
