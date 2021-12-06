import React from "react";
import { View } from "../Containers";
import { IconPin } from "./MarkerIcons";
import MapView, { MAP_TYPES, UrlTile, Marker } from "react-native-maps";
export const MapNoPolyline = ({ height = 100, width = 100, useSnapshot = false, markerLoc, delta = 0.02, onReady, }) => {
    const mapRef = React.useRef(null);
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
    return (React.createElement(View, { style: { width: width, height: height } },
        React.createElement(View, { style: { width: width, height: height, overflow: "hidden" } },
            React.createElement(MapView, { ref: mapRef, provider: "google", mapType: MAP_TYPES.NONE, style: { width: width, height: height }, initialRegion: {
                    latitude: markerLoc.latitude,
                    longitude: markerLoc.longitude,
                    latitudeDelta: delta,
                    longitudeDelta: delta,
                }, onMapReady: mapSnap, scrollEnabled: !useSnapshot, rotateEnabled: !useSnapshot, pitchEnabled: !useSnapshot },
                React.createElement(UrlTile, { urlTemplate: "https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib25pb24yayIsImEiOiJjajhvNjByM3oxaG4xMzJwZnJuYm0wY29vIn0.Kv09k5al4fgS0ago-j7Vaw" //"http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
                    , zIndex: 0 }),
                React.createElement(Marker, { coordinate: {
                        latitude: markerLoc.latitude,
                        longitude: markerLoc.longitude,
                    } }, IconPin({ type: "event", size: 30 }))))));
};
//# sourceMappingURL=MapNoPolyline.js.map