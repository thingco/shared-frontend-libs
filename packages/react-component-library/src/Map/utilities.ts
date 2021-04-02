import polylineDecoder from "@mapbox/polyline";
import { Buffer } from "buffer";

import type { MapEvent } from "./types";

/**
 * Converts a JSON string in two steps:
 * - JSON parse step should produce `{ "number": "bindata", "number": "bindata" }`
 * - Decoding step (bindata -> buffer -> utf-8 string -> GeoJSON coordinates) should
 *   produce [[number, number], [number, number], ...]
 *
 * @param polylineJSON
 */
export function processPolyline(polylineJSON: string): number[][] {
  const polylineSegments = JSON.parse(polylineJSON);

  // Data in dev is not in order, so need to sort it first.
  // Note that this should not be the case in prod.
  const polylineKeys = Object.keys(polylineSegments).sort(
    (a, b) => Number(a) - Number(b),
  );

  return polylineKeys.flatMap((key) => {
    if (polylineSegments[key] == null) {
      // Ignore null entries. There shouldn't be any in real data but
      // it's breaking in dev because of them!
      return [];
    } else {
      const buff = Buffer.from(polylineSegments[key], "base64");
      const decodedPolyString = buff.toString("utf-8");
      const { coordinates } = polylineDecoder.toGeoJSON(decodedPolyString);
      return coordinates;
    }
  });
}

/**
 * @param points
 */
export function calculateBounds(
  points: number[][],
): [[number, number], [number, number]] {
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);

  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

/**
 * @param event
 */
export function calculateEventBounds(
  event: MapEvent
): [[number, number], [number, number]] {
  const eventZoom = 0.01;

  return [
    [event.longitude - eventZoom, event.latitude - eventZoom],
    [event.longitude + eventZoom, event.latitude + eventZoom],
  ];
}
