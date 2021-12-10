import { useCallback } from "react";
import { calculators } from "@thingco/data-transformers-core";

type UseConverterOverrides = {
	precision?: number;
}

export function useConverter ({ precision = 0 }: UseConverterOverrides = {}) {
	// prettier-ignore
	return {
		blockDistanceRemaining: useCallback(
			(targetDistance: number | string, completedDistance: number | string) =>
				calculators.blockDistanceRemaining(Number(targetDistance), Number(completedDistance), precision),
			[precision]
		),
		blockPercentageProgress: useCallback(
			(targetDistance: number | string, completedDistance: number | string) =>
				calculators.blockPercentageProgress(Number(targetDistance), Number(completedDistance), precision),
			[precision]
		),
	};
}
