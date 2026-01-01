/**
 * Map Configuration
 *
 * Centralized configuration for map-related settings
 */

export const mapConfig = {
  /**
   * Default map provider implementation
   */
  provider: "leaflet" as const,

  /**
   * Default initial view if no orders are available yet
   */
  defaultView: {
    center: { lat: 47.5, lng: 19.0 },
    zoom: 7,
  },

  /**
   * Pool Order Markers Configuration
   */
  poolMarkers: {
    /**
     * Use bitmap (PNG) icons for pool order markers
     *
     * TRUE (bitmap):
     * - Faster rendering with 200+ markers (5-10x performance gain)
     * - Lower CPU usage during pan/zoom
     * - Better for mobile devices
     * - Fixed size, no scaling quality issues
     *
     * FALSE (SVG):
     * - Scales perfectly at any zoom level
     * - Slightly slower with many markers
     * - Good for < 50 markers
     * - More flexible for dynamic styling
     *
     * @default false
     */
    useBitmap: false,
  },

  /**
   * Delivery Order Markers Configuration
   */
  deliveryMarkers: {
    // Future: Add delivery marker config here if needed
  },
} as const;

export type MapConfig = typeof mapConfig;
