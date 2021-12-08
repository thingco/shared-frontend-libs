import { test } from "uvu";
import { strict as assert } from "assert";
import * as fs from "fast-check";
import { roundTo } from "./math-utils";

// Is it time?
// If yes, then do time formatting
// If no, then lets format numerically
// 1. Round number, given significant digits
// 2. If significant digits is 0 and number < 1000 then just toString it
// 3. If significant digits is 0 and number is >= 1000 then run grouping function
// 4. Otherwise, split into int and dec parts. Run grouping function on int, then
//    toFixed the dec part, slice off the initial 0 and concat result onto the
//    grouped int string.

	// const formatter = Intl.NumberFormat(locale, {
	// 	style: "decimal",
	// 	useGrouping: true,
	// 	minimumFractionDigits: precision,
	// 	maximumFractionDigits: precision,
	// });
