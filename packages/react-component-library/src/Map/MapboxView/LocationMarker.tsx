import React from "react";
import { Marker } from "react-mapbox-gl";
import { useThemeUI } from "theme-ui";

import { PinIcon } from "../../PinIcon";
import { useMapData } from "../DataProvider";
import { useMapSpeedgraphLocation } from "../SpeedgraphLocationProvider";

export const MapboxViewLocationMarker = (): JSX.Element => {
	const { locations } = useMapData();
	const { selectedSpeedgraphLocation } = useMapSpeedgraphLocation();
	const { theme } = useThemeUI();

	return (
		<Marker coordinates={locations[selectedSpeedgraphLocation]} anchor="bottom">
			<PinIcon
				size="2rem"
				stroke={theme.colors?.secondary || "black"}
				fill={theme.colors?.primary || "white"}
				iconType="car-marker"
			/>
		</Marker>
	);
};
