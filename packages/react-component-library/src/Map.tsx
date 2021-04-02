import React from "react";

import { MapDataProvider } from "./Map/DataProvider";
import { MapEventSelectionProvider } from "./Map/EventSelectionProvider";
import { MapboxView } from "./Map/MapboxView";
import { Speedgraph } from "./Map/Speedgraph";
import { SpeedgraphConfigProvider } from "./Map/Speedgraph/ConfigProvider";
import { SpeedgraphScrubber } from "./Map/Speedgraph/Scrubber";
import { MapSpeedgraphLocationProvider } from "./Map/SpeedgraphLocationProvider";

import type { MapEvent, MapSpeedGraph } from "./Map/types";

export interface MapProps {
  /** Will be one or more of `Map.{MapboxView|SpeedGraph}` plus any components that
   * should make use of the hooks provided by this part of the library.
   */
  children: React.ReactNode;
  /** A JSON-encoded string that represents a set of (GeoJSON) keyed coordinates */
  polylineJSON?: string;
  /** A list of Event objects */
  eventsList?: MapEvent[];
  /** An object containg three arrays (location, roadspeed and speed) */
  speedgraphData?: MapSpeedGraph;
  /** A flag to use when the map is only to be used to show a single event, nothing else
   * (_eg_ when it is used to show an accident location)
   */
  isSingleEventView?: boolean;
}

/**
 * The `Map` component is a container for:
 *
 * - a [Mapbox] map view, layered with a journey polyline + event markers
 * - a list of the journey events, displayed as cards that show details. Note that
 *   this isn't defined as a distinct component -- the hooks for accessing
 *   the event list (`const { eventList } = useMapData()`) and for accessing the
 *   currently selected event index (`const { selectedEvent } = useMapEventSelection()`)
 *   are enough to be able to build an interface using the primitives provided
 *   by the component library (example below).
 * - a speed graph, which allows a user to scrub along it horizontally to a specific location
 *   (this is hooked into the MapboxView, so the location is shown there as well).
 *
 * The actual `Map` component itself wraps three context providers:
 *
 * 1. `MapDataProvider`, which provides raw data that can be used by the sub components,
 * 2. `EventSelectionProvider`, which provides the value of the currently selected event (or null),
 *    plus a function to set a new selected event. This value is used both for the Mapbox view
 *    layer to add pins to it, and for the list of events.
 * 3. `SpeedgraphLocationProvider`, which provides the value of the current location on the
 *    speedgraph.
 *
 *
 * @param root0
 * @param root0.children
 * @param root0.eventsList
 * @param root0.polylineJSON
 * @param root0.speedgraphData
 * @param root0.isSingleEventView
 */
export const Map = ({
  children,
  eventsList = [],
  polylineJSON = "{}",
  speedgraphData = { Locations: [], PointSpeeds: [], RoadSpeeds: [] },
  isSingleEventView = false,
}: MapProps): JSX.Element => {
  return (
    <MapDataProvider
      polylineJSON={polylineJSON}
      speedgraphData={speedgraphData}
      eventsList={eventsList}
    >
      <MapEventSelectionProvider isSingleEventView={isSingleEventView}>
        <MapSpeedgraphLocationProvider>
          {children}
        </MapSpeedgraphLocationProvider>
      </MapEventSelectionProvider>
    </MapDataProvider>
  );
};

Map.MapboxView = MapboxView;
Map.Speedgraph = Speedgraph;
Map.SpeedgraphConfig = SpeedgraphConfigProvider;
Map.SpeedgraphScrubber = SpeedgraphScrubber;

export * from "./Map/types";
export { useMapData } from "./Map/DataProvider";
export { useMapEventSelection } from "./Map/EventSelectionProvider";
export { useMapSpeedgraphLocation } from "./Map/SpeedgraphLocationProvider";
export {
  useSpeedgraphConfig,
  useSetSpeedgraphConfig,
} from "./Map/Speedgraph/ConfigProvider";
