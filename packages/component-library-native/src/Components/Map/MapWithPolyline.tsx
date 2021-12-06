import { View } from "../Containers";
import React, { Ref } from "react";
import MapView, { LatLng, MAP_TYPES, Marker, Polyline } from "react-native-maps";
import { generate } from "shortid";
import { calculateBounds, getMapRegion } from "./MapUtil";
import { IconPin } from "./MarkerIcons";

export interface MapViewProps {
	height: number;
	width: number;
	useSnapshot: boolean;
	polyline: LatLng[];
	onReady?: (snapshotUri: string | null) => void;
	onSelectMarker?: (index: number) => void;
	markerPos?: LatLng;
	events?: LatLng[];
}
export interface MapRefProps {
	setRegion: ({ latitude, longitude }: LatLng) => void;
	resetRegion: () => void;
}

export const MapWithPolyline = React.forwardRef(
	(
		{
			height = 100,
			width = 100,
			useSnapshot = false,
			markerPos,
			polyline,
			events = [],
			onReady,
			onSelectMarker = () => null,
		}: MapViewProps,
		ref: Ref<MapRefProps>
	) => {
		const mapRef = React.useRef<MapView>(null);

		React.useImperativeHandle(ref, () => ({
			setRegion({ latitude, longitude }: LatLng) {
				mapRef.current?.animateToRegion({
					latitude: latitude,
					longitude: longitude,
					latitudeDelta: 0.001,
					longitudeDelta: 0.001,
				});
			},
			resetRegion() {
				mapRef.current?.animateToRegion(initialRegion);
			},
		}));

		const mapSnap = () => {
			setTimeout(() => {
				if (mapRef.current && mapRef.current.takeSnapshot) {
					mapRef.current
						.takeSnapshot({
							width: width,
							height: height + 25,
							result: "base64",
						})
						.then((uri) => {
							onReady && onReady(uri);
						});
				}
			}, 1000);
		};

		const eventMarkers = events.map((loc, index) => {
			return (
				<Marker
					identifier={index.toString()}
					key={index}
					coordinate={{
						latitude: loc.latitude,
						longitude: loc.longitude,
					}}
					zIndex={1}
				>
					{IconPin({ type: "event", size: 30 })}
				</Marker>
			);
		});

		const handleEventClick = (e: any) => {
			e.nativeEvent.id && onSelectMarker(parseInt(e.nativeEvent.id) + 1);
		};

		const mapBounds = calculateBounds(polyline);

		const initialRegion = getMapRegion({ ...mapBounds, height, width });

		return (
			<View style={{ width: width, height: height }}>
				<View style={{ width: width, height: height, overflow: "hidden" }}>
					<MapView
						ref={mapRef}
						provider="google"
						mapType={MAP_TYPES.STANDARD}
						style={{ width: width, height: height }}
						initialRegion={initialRegion}
						onMapReady={mapSnap}
						onMarkerPress={handleEventClick}
						scrollEnabled={!useSnapshot}
						rotateEnabled={!useSnapshot}
						pitchEnabled={!useSnapshot}
						mapPadding={{
							top: 0,
							bottom: 120,
							left: 0,
							right: 0,
						}}
					>
						<Polyline
							key={generate()}
							coordinates={polyline}
							strokeColor="#161A31"
							zIndex={1}
							strokeWidth={3}
							lineDashPattern={[1]}
						/>
						{/* <UrlTile
							urlTemplate="https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib25pb24yayIsImEiOiJjajhvNjByM3oxaG4xMzJwZnJuYm0wY29vIn0.Kv09k5al4fgS0ago-j7Vaw" //"http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
							zIndex={0}
						/> */}
						{!useSnapshot && eventMarkers}
						{!useSnapshot && markerPos && (
							<Marker
								coordinate={{
									latitude: markerPos.latitude,
									longitude: markerPos.longitude,
								}}
							>
								{IconPin({ type: "car-location", size: 30 })}
							</Marker>
						)}
					</MapView>
				</View>
			</View>
		);
	}
);
