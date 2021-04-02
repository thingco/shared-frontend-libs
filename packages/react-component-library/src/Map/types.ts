export interface MapSpeedGraph {
	Locations: [number, number][];
	PointSpeeds: number[];
	RoadSpeeds: number[];
}

/**
 * Contains useful data relating to individual events.
 * Requires an in-app mapping step to convert whatever comes out
 * of the API to something that can be consumed by the map component
 * from this library.
 */
export interface MapEvent {
	index: number | null;
	latitude: number;
	longitude: number;
	messageArgs?: Record<string, number | string>;
	name: string;
	placename: string;
	severity?: number | string | null;
	timestamp: string;
}

export type SpeedTag = "ABOVE" | "ON" | "BELOW";

export interface PolylineCoordinate {
	tag: SpeedTag;
	polylineCoordinates: { x: number; y: number }[];
}
export interface DotCoordinate {
	tag: SpeedTag;
	dotCoordinates: { x: number; y: number };
}
export interface LineCoordinate {
	tag: SpeedTag;
	lineCoordinates: { x1: number; x2: number; y1: number; y2: number };
}
