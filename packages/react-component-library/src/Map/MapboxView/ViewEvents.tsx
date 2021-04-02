import React from "react";
import { Marker } from "react-mapbox-gl";

import { PinIcon } from "../../PinIcon";
import { useMapData } from "../DataProvider";
import { useMapEventSelection } from "../EventSelectionProvider";
import shortid from "shortid";

import type { MapEvent } from "../types";
export type MapEventMarker = Pick<MapEvent, "index" | "latitude" | "longitude" | "severity">;

export type MapViewEvents = MapEventMarker[];

export const EventMarker = ({
	index,
	latitude,
	longitude,
	severity = null,
}: MapEventMarker): JSX.Element => {
	const { isSingleEventView, selectedEvent, setSelectedEvent } = useMapEventSelection();

	return (
		<Marker
			onClick={() =>
				isSingleEventView ? void 0 : setSelectedEvent(index === selectedEvent ? null : index)
			}
			coordinates={[longitude, latitude]}
			anchor="bottom"
		>
			<PinIcon size="3rem" stroke="black" fill="orange" iconType="warn-triangle-marker" />
		</Marker>
	);
};

/**
 *
 * @visibleName Map.MapboxViewEvents
 */
export const MapboxViewEvents = (): JSX.Element => {
	const { eventsList } = useMapData();
	return (
		<>
			{eventsList.map((event, i) => (
				<EventMarker
					key={shortid.generate()}
					latitude={event.latitude}
					longitude={event.longitude}
					index={i}
					severity={event.severity}
				/>
			))}
		</>
	);
};
