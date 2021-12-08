import { format } from "date-fns/fp";

export function normaliseTimestamp (timestamp: number | string): number {
	timestamp = Number(timestamp)
	if (timestamp.toString().length === 10) {
		timestamp *= 1e3;
	}
	return timestamp;
}



export function formatCompactDate (timestamp: number | string) {
	timestamp = normaliseTimestamp(timestamp);
	return format(new Date(timestamp), "P");
}
