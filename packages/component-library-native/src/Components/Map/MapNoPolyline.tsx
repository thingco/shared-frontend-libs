import React from "react";
import { View } from "../Containers";
import { IconPin } from "./MarkerIcons";

import MapView, { MAP_TYPES, UrlTile, Marker, LatLng } from "react-native-maps";

interface MapViewProps {
	height: number;
	width: number;
	useSnapshot: boolean;
	onReady?: (snapshotUri: string | null) => void;
	markerLoc: LatLng;
	delta?: number;
}

export const MapNoPolyline = ({
	height = 100,
	width = 100,
	useSnapshot = false,
	markerLoc,
	delta = 0.02,
	onReady,
}: MapViewProps) => {
	const mapRef = React.useRef<MapView>(null);

	const mapSnap = () => {
		setTimeout(() => {
			if (mapRef.current && mapRef.current.takeSnapshot) {
				mapRef.current
					.takeSnapshot({
						width: width,
						height: height,
						result: "base64",
					})
					.then((uri) => {
						onReady && onReady(uri);
					});
			}
		}, 1000);
	};

	return (
		<View style={{ width: width, height: height }}>
			<View style={{ width: width, height: height, overflow: "hidden" }}>
				<MapView
					ref={mapRef}
					provider="google"
					mapType={MAP_TYPES.NONE}
					style={{ width: width, height: height }}
					initialRegion={{
						latitude: markerLoc.latitude,
						longitude: markerLoc.longitude,
						latitudeDelta: delta,
						longitudeDelta: delta,
					}}
					onMapReady={mapSnap}
					scrollEnabled={!useSnapshot}
					rotateEnabled={!useSnapshot}
					pitchEnabled={!useSnapshot}
				>
					<UrlTile
						urlTemplate="https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib25pb24yayIsImEiOiJjajhvNjByM3oxaG4xMzJwZnJuYm0wY29vIn0.Kv09k5al4fgS0ago-j7Vaw" //"http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
						zIndex={0}
					/>
					<Marker
						coordinate={{
							latitude: markerLoc.latitude,
							longitude: markerLoc.longitude,
						}}
					>
						{IconPin({ type: "event", size: 30 })}
					</Marker>
				</MapView>
			</View>
		</View>
	);
};
