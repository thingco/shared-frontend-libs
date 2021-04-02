import type { SpeedTag, PolylineCoordinate, DotCoordinate, LineCoordinate } from "../types";

/**
 * Zips the pointSpeeds and the roadSpeeds arrays together for ease of comparison.
 *
 * TODO fail on mismatched lengths.
 *
 * @param pointSpeeds
 * @param roadSpeeds
 */
export function* zipSpeeds(
  pointSpeeds: number[],
  roadSpeeds: number[]
): Generator<[number, number]> {
  let cursor = 0;
  while (cursor < pointSpeeds.length) {
    yield [pointSpeeds[cursor], roadSpeeds[cursor]];
    cursor++;
  }
}

/**
 * Compares each of the zipped pointSpeeds and roadSpeeds in turn -- if pointSpeed is lower
 * than roadSpeed, yields a speed tagged with "BELOW". If same, yields a speed tagged with "ON".
 * if higher, yields a speed tagged with "ABOVE".
 *
 * @param zippedSpeeds
 */
export function* tagSpeeds(
  zippedSpeeds: [number, number][] | Generator<[number, number]>
): Generator<{ tag: SpeedTag; speed: number; }> {
  for (let [pointSpeed, roadSpeed] of zippedSpeeds) {
    // Sanity check
    // TODO log bad values before swallowing
    pointSpeed = pointSpeed < 0 ? 0 : pointSpeed;
    roadSpeed = roadSpeed < 0 ? 0 : roadSpeed;

    if (pointSpeed < roadSpeed) {
      yield { tag: "BELOW", speed: pointSpeed };
    } else if (pointSpeed === roadSpeed) {
      yield { tag: "ON", speed: pointSpeed };
    } else if (pointSpeed > roadSpeed) {
      yield { tag: "ABOVE", speed: pointSpeed };
    }
  }
}

/**
 * Steps through the tagged point speeds, chunking the speeds of consecutive points into single
 * results -- easier to describe with an example:
 *
 *     [{ tag: "BELOW", speed: 10 }, { tag: "BELOW", speed: 11 }, { tag: "BELOW", speed: 12 }]
 *
 * Will become
 *
 *     [{ tag: "BELOW", speed: [10, 11, 12] }
 *
 * This means that each element in the output from `mergeSpeeds` can be used to build a
 * polyline (for example) that can be styled in a specific way.
 *
 * @param taggedPointSpeeds
 */
export function* mergeSpeeds(
  taggedPointSpeeds:
    | { tag: SpeedTag; speed: number; }[]
    | Generator<{ tag: SpeedTag; speed: number; }>
): Generator<{ tag: SpeedTag; speeds: number[]; }> {
  let prev: { tag: SpeedTag; speed: number; } | null = null;
  let chunk: { tag: SpeedTag; speeds: number[]; } | null = null;

  for (const current of taggedPointSpeeds) {
    if (!prev) {
      chunk = { tag: current.tag, speeds: [current.speed] };
    } else if (prev.tag === current.tag && chunk) {
      chunk.speeds.push(current.speed);
    } else if (prev.tag !== current.tag && chunk) {
      yield chunk;
      chunk = { tag: current.tag, speeds: [current.speed] };
    }
    prev = current;
  }
  if (chunk) yield chunk;
}

/**
 * Steps through the _merged_ tagged point speeds, and produces a set of
 * polyline coordinate strings
 *
 * - copies the last value from the previous element's speeds array and adds it to
 *   the start of the current one.
 * - makes the (new) list of speeds into a string of polyline points, taking into
 *   account the additional speed point just added.
 *
 * This is purely for polylines, allowing a set of polylines to be constructed that all join
 * up visually (otherwise there would be a gap between each change of tag).
 *
 * @param taggedPointSpeeds
 */
export function* generatePolyPoints(
  taggedPointSpeeds:
    | { tag: SpeedTag; speeds: number[]; }[]
    | Generator<{ tag: SpeedTag; speeds: number[]; }>,
): Generator<PolylineCoordinate> {
  let xIndex = 0;
  let prevChunk: { tag: SpeedTag; speeds: number[]; } | null = null;

  for (const current of taggedPointSpeeds) {
    if (!prevChunk) {
      const polylineCoordinates = current.speeds
        .map((speed, idx) => ({ x: idx, y: speed }));
      yield {
        tag: current.tag,
        polylineCoordinates
      };
    } else if (prevChunk) {
      const lastPoint = prevChunk.speeds[prevChunk.speeds.length - 1];
      const polylineCoordinates = [lastPoint, ...current.speeds]
        .map((speed, idx) => ({ x: idx + xIndex - 1, y: speed }));
      yield {
        tag: current.tag,
        polylineCoordinates
      };
    }
    prevChunk = current;
    xIndex += current.speeds.length;
  }
}

/**
 * @param taggedPointSpeeds
 */
export function* generateDotCoordinates(
  taggedPointSpeeds:
    | { tag: SpeedTag; speed: number; }[]
    | Generator<{ tag: SpeedTag; speed: number; }>
): Generator<DotCoordinate> {
  let idx = 0;

  for (const current of taggedPointSpeeds) {
    yield {
      tag: current.tag,
      dotCoordinates: {
        x: idx,
        y: current.speed
      }
    };
    idx++;
  }
}

/**
 * @param taggedPointSpeeds
 */
export function* generateLineCoordinates(
  taggedPointSpeeds:
    | { tag: SpeedTag; speed: number; }[]
    | Generator<{ tag: SpeedTag; speed: number; }>
): Generator<LineCoordinate> {
  let idx = 0;

  for (const current of taggedPointSpeeds) {
    yield {
      tag: current.tag,
      lineCoordinates: {
        x1: idx,
        x2: idx,
        y1: 0,
        y2: current.speed
      }
    };
    idx++;
  }
}
