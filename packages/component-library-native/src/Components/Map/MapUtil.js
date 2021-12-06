import polyline from "@mapbox/polyline";
import { Buffer } from "buffer";
export function calculateBounds(points) {
    const lngs = points.map((p) => p.longitude);
    const lats = points.map((p) => p.latitude);
    return {
        min: { latitude: Math.min(...lats), longitude: Math.min(...lngs) },
        max: { latitude: Math.max(...lats), longitude: Math.max(...lngs) },
        mid: {
            latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
            longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
        },
    };
}
export function processPolyline(polylineJSON) {
    const polylineSegments = JSON.parse(polylineJSON);
    // Data in dev is not in order, so need to sort it first.
    // Note that this should not be the case in prod.
    const polylineKeys = Object.keys(polylineSegments).sort((a, b) => Number(a) - Number(b));
    return polylineKeys.flatMap((key) => {
        if (polylineSegments[key] == null) {
            // Ignore null entries. There shouldn't be any in real data but
            // it's breaking in dev because of them!
            return [];
        }
        else {
            const buff = Buffer.from(polylineSegments[key], "base64");
            const decodedPolyString = buff.toString("utf-8");
            const coordinates = polyline.decode(decodedPolyString);
            return coordinates.map((i) => ({ latitude: i[0], longitude: i[1] }));
        }
    });
}
export function getMapRegion({ max, min, mid, }) {
    const deltaX = (max.latitude - min.latitude) * 2.5;
    const deltaY = (max.longitude - min.longitude) * 2.5;
    return {
        latitude: mid.latitude,
        longitude: mid.longitude,
        latitudeDelta: deltaX,
        longitudeDelta: deltaY,
    };
}
//# sourceMappingURL=MapUtil.js.map