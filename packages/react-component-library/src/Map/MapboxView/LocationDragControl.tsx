import React from "react";
import { Feature, Layer } from "react-mapbox-gl";
import { useThemeUI } from "theme-ui";

interface MapboxViewLocationDragControlProps {
	locations: number[][];
	selectedSpeedgraphLocation: number;
	setSelectedSpeedgraphLocation: (locationIndex: number) => void;
}

interface DragEvent {
	lngLat: { lng: number; lat: number };
	[k: string]: any;
}

/**
 * @param fn
 * @param delay
 */
function throttle(fn: (...args: any) => any, delay: number) {
	let lastCall = 0;
	return function (...args: any) {
		const now = new Date().getTime();
		if (now - lastCall < delay) {
			return;
		}
		lastCall = now;
		return fn(...args);
	};
}

/**
 * @param e
 * @param locations
 * @param setNewLocationIndex
 */
function dragHandler(
	e: DragEvent,
	locations: number[][],
	setNewLocationIndex: (newIdx: number) => void
): void {
	const { lng: dragLong, lat: dragLat } = e.lngLat;
	// Map the `[long, lat][]` array of coordinates to `[hypotenuse, originalIndex][]`,
	// based on the position of the drag control, then sort ascending. First item is the
	// closest to the drag marker:
	const sortedDists = locations
		.map(([long, lat], i) => [Math.sqrt((dragLong - long) ** 2 + (dragLat - lat) ** 2), i])
		.sort((a, b) => a[0] - b[0]);
	const nearestIndex = sortedDists[0][1];

	setNewLocationIndex(nearestIndex);
}

const throttledDragHandler = throttle(dragHandler, 50);

export const MapboxViewLocationDragControl = ({
	selectedSpeedgraphLocation,
	setSelectedSpeedgraphLocation,
	locations,
}: MapboxViewLocationDragControlProps): JSX.Element => {
	const { theme } = useThemeUI();

	return (
		<Layer
			type="circle"
			paint={{
				"circle-radius": 30,
				"circle-color": theme.colors?.primary,
				"circle-opacity": 0.25,
			}}
		>
			<Feature
				coordinates={locations[selectedSpeedgraphLocation]}
				draggable={true}
				onDrag={(e: any) => {
					throttledDragHandler(e, locations, setSelectedSpeedgraphLocation);
				}}
			/>
		</Layer>
	);
};
