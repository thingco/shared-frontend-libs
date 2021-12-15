import {
  distance,
	distanceUntilScored,
	speed,
} from "@thingco/data-transformers-core";
import { strict as assert } from "assert";
import { suite } from "uvu";
import * as fc from "fast-check";


const distanceAndSpeedFormattersSuite = suite("distance/speed formatters");

distanceAndSpeedFormattersSuite("distance/speed formatters all accept a string of digits or a integer and return a string", () => {
	for (const formatter of [distance, distanceUntilScored, speed]) {
		fc.assert(
			fc.property(
				fc.oneof(
					fc.nat(),
					fc.nat().map(i => i.toString()),
				),
			  (input) => {
				  const result = formatter()(input);
				  assert.equal(typeof result, "string");
			  }
	    )
		);
	}
});


distanceAndSpeedFormattersSuite("the result of the distance/speed formatter functions has thousands seperated with commas", () => {
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


distanceAndSpeedFormattersSuite("adjusting the precision of the distance/speed formatter functions adjusts the number of fractional digits in the formatted result", () => {
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
			  (input, precision, ctx) => {
				  const result = formatter({ precision })(input);
					ctx.log(`For "${formatter.name}" with precision set to ${precision}, input of ${input} formats to ${result}`);
		      assert.equal(numberOfFractionalDigits(result), precision);
			  }
	    ),
			{ verbose: true }
		);
	}
});


distanceAndSpeedFormattersSuite.run();
