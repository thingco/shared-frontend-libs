import React from "react";

import { processPolyline } from "./utilities";

import type { MapEvent, MapSpeedGraph } from "./types";

export interface MapDataContextValues {
  eventsList: MapEvent[];
  polyline: number[][];
  roadSpeeds: number[];
  pointSpeeds: number[];
  locations: number[][];
}

const MapDataContext = React.createContext<MapDataContextValues>({
  eventsList: [],
  polyline: [],
  roadSpeeds: [],
  pointSpeeds: [],
  locations: [],
});

interface MapDataProviderProps {
  children: React.ReactNode;
  eventsList?: MapEvent[];
  polylineJSON?: string;
  speedgraphData?: MapSpeedGraph;
}

/**
 * There is a possibility that some of the the point speeds are incorrect.
 * This should not happen with production data, but definitely does happen
 * test data (currently the minimum observed is -9223372036854776000, which
 * is clearly impossible).
 *
 * - Any negative number is impossible.
 * - Any positive number greater than a sane speed is probably impossible
 *   (if the car was dropped out of an aeroplane or fell off a mountain, then
 *   conceivably the figure could be correct, but anyway...)
 */
const FASTEST_ROAD_SPEED = 490.4845989;
/**
 * @param pointSpeed
 */
function sanitisePointSpeed(pointSpeed: number) {
  switch (true) {
    case pointSpeed === null:
      return 0;
    case pointSpeed < 0:
      return 0;
    case pointSpeed > FASTEST_ROAD_SPEED:
      return FASTEST_ROAD_SPEED;
    default:
      return pointSpeed;
  }
}

export const MapDataProvider = ({
  children,
  eventsList = [],
  polylineJSON,
  speedgraphData,
}: MapDataProviderProps): JSX.Element => {
  // If there is polyine data, convert it to an array of `[long, lat][]` (GeoJSON) coordinates:
  const polyline = polylineJSON ? processPolyline(polylineJSON) : [];
  // If there is speedgraph data, extract the road speeds array:
  const roadSpeeds = speedgraphData?.RoadSpeeds ?? [];
  // If there is speedgraph data, extract the point speeds array and sanitise it:
  const pointSpeeds = speedgraphData?.PointSpeeds ? speedgraphData?.PointSpeeds.map(sanitisePointSpeed) : [];
  // If there is speedgraph data, extract the location coordinates array and map from
  // ThingCo system style (`[lat, long][]`) to GeoJSON style (`[long, lat][]`):
  const locations = speedgraphData?.Locations ?
    speedgraphData?.Locations.map(([lat, long]) => [long, lat]) : [];

  return (
    <MapDataContext.Provider
      value={{
        eventsList,
        polyline,
        roadSpeeds,
        pointSpeeds,
        locations,
      }}
    >
      {children}
    </MapDataContext.Provider>
  );
};

/**
 *
 */
export function useMapData(): MapDataContextValues {
  const data = React.useContext(MapDataContext);
  if (!MapDataContext) {
    throw new Error(
      "`useMapData` can only be called from a component below the MapDataProvider in the tree."
    );
  }
  return data;
}
