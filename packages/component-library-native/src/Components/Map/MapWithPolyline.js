import React from "react";
import MapView, { MAP_TYPES, Marker, Polyline, UrlTile } from "react-native-maps";
import { generate } from "shortid";
import { View } from "../Containers";
import { calculateBounds, getMapRegion } from "./MapUtil";
import { IconPin } from "./MarkerIcons";
export const MapWithPolyline = React.forwardRef(({ height = 100, width = 100, useSnapshot = false, markerPos, polyline, events = [], onReady, onSelectMarker = () => null, }, ref) => {
    const mapRef = React.useRef(null);
    React.useImperativeHandle(ref, () => ({
        setRegion({ latitude, longitude }) {
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
        return (React.createElement(Marker, { identifier: index.toString(), key: index, coordinate: {
                latitude: loc.latitude,
                longitude: loc.longitude,
            }, zIndex: 1 }, IconPin({ type: "event", size: 30 })));
    });
    const handleEventClick = (e) => {
        e.nativeEvent.id && onSelectMarker(parseInt(e.nativeEvent.id) + 1);
    };
    const mapBounds = calculateBounds(polyline);
    const initialRegion = getMapRegion({ ...mapBounds, height, width });
    return (React.createElement(View, { style: { width: width, height: height } },
        React.createElement(View, { style: { width: width, height: height, overflow: "hidden" } },
            React.createElement(MapView, { ref: mapRef, provider: "google", mapType: MAP_TYPES.NONE, style: { width: width, height: height }, initialRegion: initialRegion, onMapReady: mapSnap, onMarkerPress: handleEventClick, scrollEnabled: !useSnapshot, rotateEnabled: !useSnapshot, pitchEnabled: !useSnapshot, mapPadding: {
                    top: 0,
                    bottom: 120,
                    left: 0,
                    right: 0,
                } },
                React.createElement(Polyline, { key: generate(), coordinates: polyline, strokeColor: "#161A31", zIndex: 1, strokeWidth: 3, lineDashPattern: [1] }),
                React.createElement(UrlTile, { urlTemplate: "https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib25pb24yayIsImEiOiJjajhvNjByM3oxaG4xMzJwZnJuYm0wY29vIn0.Kv09k5al4fgS0ago-j7Vaw" //"http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
                    , zIndex: 0 }),
                !useSnapshot && eventMarkers,
                !useSnapshot && markerPos && (React.createElement(Marker, { coordinate: {
                        latitude: markerPos.latitude,
                        longitude: markerPos.longitude,
                    } }, IconPin({ type: "car-location", size: 30 })))))));
});
//# sourceMappingURL=MapWithPolyline.js.map