import React from "react";
import ReactMapboxGl from "react-mapbox-gl";

import { useMapData } from "./DataProvider";
import { useMapEventSelection } from "./EventSelectionProvider";
import { MapboxViewLocationDragControl } from "./MapboxView/LocationDragControl";
import { MapboxViewLocationMarker } from "./MapboxView/LocationMarker";
import { MapboxViewPolyline } from "./MapboxView/Polyline";
import { MapboxViewEvents } from "./MapboxView/ViewEvents";
import { useMapSpeedgraphLocation } from "./SpeedgraphLocationProvider";
import { calculateBounds, calculateEventBounds } from "./utilities";

export interface MapboxViewProps {
  /** The container style. THIS IS REQUIRED to enable the map to fit nicely within the pages grid/card layout (though you may only need the height). Expect to need tweak this. */
  containerStyle: React.CSSProperties;
  /** The mapbox tile style -- see https://docs.mapbox.com/help/glossary/style-url/ */
  mapStyle?: string;
  /** Defaults to black */
  polylineColour?: string;
}

const accessToken =
  "pk.eyJ1Ijoib25pb24yayIsImEiOiJjajhvNjByM3oxaG4xMzJwZnJuYm0wY29vIn0.Kv09k5al4fgS0ago-j7Vaw";

export const MapboxInstance = ReactMapboxGl({ accessToken });

/**
 *
 * @param root0
 * @param root0.mapStyle
 * @param root0.containerStyle
 * @param root0.polylineColour
 * @visibleName Map.MapboxView
 */
export const MapboxView = ({
  mapStyle = "mapbox://styles/mapbox/streets-v11",
  containerStyle,
  polylineColour = "#000",
}: MapboxViewProps): JSX.Element => {
  const { polyline, eventsList, locations } = useMapData();
  const { selectedEvent } = useMapEventSelection();
  const {
    selectedSpeedgraphLocation,
    setSelectedSpeedgraphLocation,
  } = useMapSpeedgraphLocation();
  
  let boundingBox;

  if (eventsList.length === 0 && polyline.length === 0) {
    console.warn("No polyline or events data -- nothing to show on map.");
    boundingBox = undefined;
  } else if (eventsList.length > 0 && selectedEvent !== null) {
    boundingBox = calculateEventBounds(eventsList[selectedEvent as number]);
  } else if (selectedEvent === null && polyline.length > 0) {
    boundingBox = calculateBounds(polyline);
  } else {
    throw new Error("Cannot calculate bounding box");
  }

  return (
    <MapboxInstance
      style={mapStyle}
      containerStyle={containerStyle}
      fitBounds={boundingBox}
      fitBoundsOptions={{ padding: 20 }}
    >
      <>
        {polyline.length > 0 && (
          <MapboxViewPolyline
            polyline={polyline}
            polylineColour={polylineColour}
          />
        )}
        {locations.length > 0 && (
          <>
            <MapboxViewLocationDragControl
              locations={locations}
              selectedSpeedgraphLocation={selectedSpeedgraphLocation}
              setSelectedSpeedgraphLocation={setSelectedSpeedgraphLocation}
            />
            <MapboxViewLocationMarker />
          </>
        )}
        {eventsList.length > 0 && <MapboxViewEvents />}
      </>
    </MapboxInstance>
  );
};
