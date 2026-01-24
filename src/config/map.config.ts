  /**
   * Filter button and marker base colors (single source of truth)
   */
  filterColors: {
    priority: {
      low: '#fd5c63',
      medium: '#BD3039',
      high: '#C6011F',
    },
    status: {
      pending: '#90EE90',
      inprogress: '#3CB371',
      completed: '#2E8B57',
      cancelled: '#444C38',
    },
    amount: {
      low: '#eec0c8',
      medium: '#F9629F',
      high: '#FF00FF',
    },
    complexity: {
      simple: '#F0E68C',
      moderate: '#FFFF00',
      complex: '#FEBE10',
    },
  },
/**
 * Map Configuration
 *
 * Centralized configuration for map-related settings
 */

export const mapConfig = {
  /**
   * Unassigned Order Markers Configuration
   */
  unassignedMarkers: {
    /**
     * Use bitmap (PNG) icons for unassigned order markers
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
