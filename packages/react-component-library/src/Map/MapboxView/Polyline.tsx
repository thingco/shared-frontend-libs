import React from "react";
import { Feature, Layer } from "react-mapbox-gl";

interface MapboxViewPolylineProps {
	polyline: number[][];
	polylineColour: string;
}

export const MapboxViewPolyline = ({
	polyline,
	polylineColour,
}: MapboxViewPolylineProps): JSX.Element => (
	<Layer
		type="line"
		layout={{ "line-cap": "round", "line-join": "round" }}
		paint={{ "line-color": polylineColour, "line-width": 4 }}
	>
		<Feature coordinates={polyline} />
	</Layer>
);
