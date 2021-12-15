import {
  distance,
	distanceUntilScored,
	speed,
} from "@thingco/data-transformers-core";
import { strict as assert } from "assert";
import { test } from "uvu";
import * as fc from "fast-check";

test("distance/speed formatters accept a non-negative integer in the form of digits or a string of digit characters, andything else will cause the formatter to error", () => {
	for (const formatter of [distance, distanceUntilScored, speed]) {
		fc.assert(
			fc.property(
				fc.oneof(
					fc.integer(),
					fc.float(),
					fc.string()
				),
				fc.context(),
				(input) => {
					const inputAsNumber = Number(input);
					if (Number.isNaN(inputAsNumber) || inputAsNumber < 0 || !Number.isInteger(inputAsNumber)) {
						assert.throws(() => formatter()(input));
					} else {
						const result = formatter()(input);
						assert.equal(typeof result, "string");
					}
				}
			)
		);
	}
});

test("distance/speed formatters all accept a string of digits or a integer and return a string", () => {
	for (const formatter of [distance, distanceUntilScored, speed]) {
		fc.assert(
			fc.property(
				fc.oneof(
					fc.nat(),
					fc.nat().map(i => i.toString()),
				),
				fc.context(),
			  (input, ctx) => {
				  const result = formatter()(input);
          ctx.log(`For "${formatter.name}", ${input} produces the string ${result}`);
				  assert.equal(typeof result, "string");
			  }
	    )
		);
	}
});


test("the result of the distance/speed formatter functions has thousands seperated with commas", () => {
	function checkThousandsSeparatorsAsExpected(result: string, separator = ",") {
		const parts = result.split(separator).flatMap(res => res.match(/\d+/g));

		if (parts.length === 0)  {
			return false;
		} else {
			return parts.every((part, i) => {
				if (i === 0) return part && part.length <= 3;
				return part && part.length === 3;
			});
		}
	}


	for (const formatter of [distance, distanceUntilScored, speed]) {
		fc.assert(
			fc.property(
				fc.nat(),
				fc.context(),
			  (input, ctx) => {
				  const result = formatter()(input);
					ctx.log(`For "${formatter.name}", input of ${input} formats to ${result}`);
					assert.ok(checkThousandsSeparatorsAsExpected(result));
			  }
	    ),
			{ verbose: true }
		);
	}
});


test("adjusting the fractionalDigits of the distance/speed formatter functions adjusts the number of fractional digits in the formatted result", () => {
	function numberOfFractionalDigits(result: string, seperator = ".") {
		const fractionalPart = result.split(seperator)[1];
		const hasDecimalPoint = result.includes(seperator);
    if (!hasDecimalPoint) {
			return 0;
		} else {
			const fractionalPartValue = fractionalPart.match(/\d+/g);
			return fractionalPartValue ? fractionalPartValue[0].length : 0;
		}
	}


	for (const formatter of [distance, distanceUntilScored, speed]) {
		fc.assert(
			fc.property(
				fc.nat(),
				fc.nat({ max: 5}),
				fc.context(),
			  (input, fractionalDigits, ctx) => {
				  const result = formatter({ fractionalDigits })(input);
					ctx.log(`For "${formatter.name}" with fractionalDigits set to ${fractionalDigits}, input of ${input} formats to ${result}`);
		      assert.equal(numberOfFractionalDigits(result), fractionalDigits);
			  }
	    ),
			{ verbose: true }
		);
	}
});

// test("the formatters append a unit to the formatted result", () => {
// 	for (const formatter of [distance, distanceUntilScored, speed]) {
// 		fc.assert(
// 			fc.property(
// 				fc.nat(),
// 				fc.context(),
// 			  (input, ctx) => {
// 				  const result = formatter()(input);
// 					ctx.log(`For "${formatter.name}", input of ${input} formats to ${result}`);
// 					assert.ok(result.endsWith(formatter.unit));
// 			  }
// 	    ),
// 			{ verbose: true }
// 		);
// 	}
// });


test.run();
