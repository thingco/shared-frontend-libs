import { roundTo } from "./math-utils";

type FractionalSeperator = "." | ",";
type GroupSeperator = "." | ",";

type FormatOpts = {
	fractionalSeperator: FractionalSeperator;
	groupSeperator: GroupSeperator;
}

function localeFormatOpts (locale?: string): FormatOpts {
	const opts: FormatOpts = { fractionalSeperator: ".", groupSeperator: "," };

	if (locale === undefined) {
		return opts;
	}

	switch (true) {
		case /en/.test(locale):
			return opts;
		default:
			return opts;
	}
}


export function formatDecimal (num: number, significantDigits: number, locale?: string) {
	const { fractionalSeperator, groupSeperator } = localeFormatOpts(locale);
	const roundedInput = roundTo(num, significantDigits);
	const int = Math.trunc(roundedInput);

	if (significantDigits === 0) {
		return groupedInt(int, groupSeperator);
	} else {
		const frac = Math.round((roundedInput % 1) * 100000000) / 100000000;
		return groupedInt(int, groupSeperator) + fractionalSeperator + fixedFrac(frac, significantDigits);
	}
}

function groupedInt(int: number, seperator: string) {
	const isNegative = int < 0;
	const inputIntStr = Math.abs(int).toString();
	let output = ""


	if (inputIntStr.length < 4) {
		output = inputIntStr;
	} else {
    let counter = 1;

		for (let i = inputIntStr.length - 1; i >= 0; i--) {
      console.log(i, inputIntStr[i], counter);
			if (counter !== inputIntStr.length && counter % 3 === 0) {
				output = `${seperator}${inputIntStr[i]}${output}`;
			} else {
				output = `${inputIntStr[i]}${output}`;
			}
      counter++;
		}
	}

	return (isNegative ? "-" : "") + output;
}

function fixedFrac(frac: number, significantDigits: number) {
	return Math.abs(frac).toFixed(significantDigits).slice(2);
}
