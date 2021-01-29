# Creating a Dataviz library

## Goals

A general, reusable library for:

1. presentation of static data (using SVG) and
2. presentation of map data

The library core consists of a graph and a map module, along with small modules for presentation of small amounts of data -- gauges, bars etc.

The library core is just Typescript, but has renderers for React (and for React native going forwards).

Each module should have a model of some kind (a constructor for an object, so class is simplest). Then a set of functions to work on that data structure.

Then module/s containing functions for projecting the data structure to the rendering layer.

Then React components that use those functions to build out the visual content.

Splitting it this way seems the easiest way to enable it to be

1. easily tested
2. used in non-React contexts

## Graphs

1. Data is plotted on an SVG graph.
2. Each axis the data is plotted on has a certain arbitrarily defined size.
3. The values plotted on the graph axes fit within a range. By default, this range will go from zero to the
   maximum value in the data.
4. By using the size and the range, can calculate a scale for the data.
5. By multiplying a value by the scale, can calculate a coordinate to plot on the graph.

So at a _minimum_, need one set of values to be plotted, and the rendered size of the x- and y-axes. That will then default to minimum of 0 for the values, max of Math.max(values). Scale of axis size / (max - min). Minimum of 0 for the opposing axis and max of values.length - 1 (it will just assume an ascending series). Scale of axis size / (max - min).

Lets start with something simple. A customer has a series of blocks, numbered 1-10. Each block is scored out of 100. Block numbers are plotted on the x-axis, scores on the y-axis. The data:

```js
yAxisValues = [49, 50, 56, 56, 71, 74, 75, 76, 78, 83];
yAxisSize = 100;
xAxisSize = 100;
```

This will fill in

```js
yAxisMax = 83;
yAxisMin = 0;
yAxisScale = 1.2;
xAxisValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
xAxisMax = 9;
xAxisMin = 0;
xAxisScale = 11.1;
```

So the min/max values need to be customisable. In the above example, I want the y-axis to go from 0 to 100. So I need to be able to manually set the axis min/max values.

```js
yAxisValues = [49, 50, 56, 56, 71, 74, 75, 76, 78, 83];
yAxisSize = 100;
yAxisMin = 0;
yAxisMax = 100;
xAxisSize = 100;
```

This will fill in

```js
yAxisScale = 1;
xAxisValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
xAxisMax = 9;
xAxisMin = 0;
xAxisScale = 11.1;
```

In the example, the block numbers go from 1-10, so I can set the axis min/max values again, which should change the output:

```js
yAxisValues = [49, 50, 56, 56, 71, 74, 75, 76, 78, 83];
yAxisSize = 100;
yAxisMin = 0;
yAxisMax = 100;
xAxisSize = 100;
xAxisMin = 1;
xAxisMax = 10;
```

This should result in the same (_if explicit values are not given for the opposing axis, a range should be created of the correct length_):

```js
yAxisScale = 1;
xAxisValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
xAxisScale = 11.1;
```

For annotations and repeated grid lines, it is important that they can be stepped by a certain amount. In the example, I would like an annotation on the y-axis every 25 units, and on the x-axis every 1 unit.

```js
yAxisValues = [49, 50, 56, 56, 71, 74, 75, 76, 78, 83];
yAxisSize = 100;
yAxisMin = 0;
yAxisMax = 100;
yAxisStep = 25;
xAxisSize = 100;
xAxisMin = 1;
xAxisMax = 10;
xAxisStep = 1;
```

This should result in the same:

```js
yAxisScale = 1;
xAxisValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
xAxisScale = 11.1;
```

The stepped elements are useful only when rendering, so they should be generated using a function that accepts the above data and produces an array of values for the appropriate axis

```ts
export function steppedAxisValues(
	axisMin: number,
	axisMax: number,
	axisStep: number
): number[] {
	const vals = [];

	if (axisMin > 0) {
		for (let v = axisMin; v <= axisMax; v += axisStep) vals.push(v);
		return vals;
		// NOTE FOLLOWING BLOCK IS CURRENTLY NOT QUITE CORRECT, CURRENTLY UNECESSARY
		// SO ELIDE AND TEST PROPERLY
	} else if (axisMin < 0 && axisMax < 0) {
		for (let v = axisMin; v >= axisMax; v -= axisStep) vals.push(v);
	} else {
		vals.push(0);
		for (let v = 0 - axisStep; v >= axisMin; v -= axisStep) vals.unshift(v);
		for (let v = 0 + axisStep; v <= axisMax; v += axisStep) vals.push(v);
		return vals;
	}
}
```

So if the min & max values are positive, step upwards from the min. If they're both negative, step down from the min. Otherwise set a value at zero, then step down from that to min and up from that to max.

> NOTE because the data structure produced at first has seperated x- and y- values, there will need to be two functions, one for each axis.

So encapsulate this. Interface for the data structure:

```ts
interface GraphData {
	xAxisMax: number;
	xAxisMin: number;
	xAxisScale: number;
	xAxisSize: number;
	xAxisStep: number;
	xAxisValues: number[];
	yAxisMax: number;
	yAxisMin: number;
	yAxisScale: number;
	yAxisSize: number;
	yAxisStep: number;
	yAxisValues: number[];
}
```

Then a function that accepts a partial version of this and fills in the missing values (with a helper function for calculating scale):

```ts
function calculateScale(
	axisSize: number,
	axisMin: number,
	axisMax: number
): number {
	return axisSize / (axisMax - axisMin);
}

function createGraph({
	xAxisMax,
	xAxisMin = 0,
	xAxisSize,
	xAxisStep = 1,
	xAxisValues,
	yAxisMax,
	yAxisMin = 0,
	yAxisSize,
	yAxisStep = 1,
	yAxisValues,
}: Partial<GraphData>): GraphData {
	if (!(xAxisSize && yAxisSize)) {
		throw new Error(
			"BOTH the x- and y-axis size MUST be provided to create the graph."
		);
	}
	if (!(xAxisValues && yAxisValues)) {
		throw new Error(
			"ONE OR BOTH x- or y-axis value arrays MUST be provided to create the graph."
		);
	}
	if (!xAxisValues) {
		xAxisValues = Array.from(
			{ length: yAxisValues.length },
			(_, i) => i + xAxisMin
		);
	}
	if (!yAxisValues) {
		yAxisValues = Array.from(
			{ length: xAxisValues.length },
			(_, i) => i + yAxisMin
		);
	}
	xAxisMax = xAxisMax ?? Math.max(...xAxisValues);
	yAxisMax = yAxisMax ?? Math.max(...yAxisValues);

	const xAxisScale = calculateScale(xAxisSize, xAxisMin, xAxisMax);
	const yAxisScale = calculateScale(yAxisSize, yAxisMin, yAxisMax);

	return {
		xAxisMax,
		xAxisMin,
		xAxisScale,
		xAxisSize,
		xAxisStep,
		xAxisValues,
		yAxisMax,
		yAxisMin,
		yAxisScale,
		yAxisSize,
		yAxisStep,
		yAxisValues,
	};
}
```

And the step functions from before:

```ts
function steppedXAxisValues({
	xAxisMin,
	xAxisMax,
	xAxisStep,
}: GraphData): number[] {
	const vals = [];

	// TODO currently ignoring graphs that only have data with negative values that should be plotted
	// starting on a value < 0.
	if (xAxisMin > 0) {
		for (let v = xAxisMin; v <= xAxisMax; v += xAxisStep) vals.push(v);
		return vals;
	} else {
		vals.push(0);
		for (let v = 0 - xAxisStep; v >= xAxisMin; v -= xAxisStep) vals.unshift(v);
		for (let v = 0 + xAxisStep; v <= xAxisMax; v += xAxisStep) vals.push(v);
		return vals;
	}
}

function steppedYAxisValues({
	yAxisMin,
	yAxisMax,
	yAxisStep,
}: GraphData): number[] {
	const vals = [];

	// TODO currently ignoring graphs that only have data with negative values that should be plotted
	// starting on a value < 0.
	if (yAxisMin > 0) {
		for (let v = yAxisMin; v <= yAxisMax; v += yAxisStep) vals.push(v);
		return vals;
	} else {
		vals.push(0);
		for (let v = 0 - yAxisStep; v >= yAxisMin; v -= yAxisStep) vals.unshift(v);
		for (let v = 0 + yAxisStep; v <= yAxisMax; v += yAxisStep) vals.push(v);
		return vals;
	}
}
```

Nex, I need to be able to use the data there to project the points to SVG coordinates. This is simple enough now I know the scale and the axis min values. Regarding subtracting the axis min value from the value passed into the function:

- if the min value is zero, then I'm basically just multiplying the coord value by the scale.
- if the min value is > zero, then zero in the SVG viewBox is equivalent to the bottom left, so coord values get shifted left/down (and if down, they are inverted, so they go up)
- if the min value is < 0, then where the graph zero should be plotted in the SVG viewBox is somewhere to the right of SVG viewBox zero. So coordinate - -val == coordinate + val, therefore coordinate values get shifted right/up (and if up, they are inverted, so they go down).

```ts
function projectXCoordToSVG(
	{ xAxisMin, xAxisScale }: GraphData,
	axisCoord: number
): number {
	return (axisCoord - xAxisMin) * xAxisScale;
}

function projectYCoordToSVG(
	{ yAxisMin, yAxisScale, yAxisSize }: GraphData,
	axisCoord: number
): number {
	return yAxisSize - (axisCoord - yAxisMin) * yAxisScale;
}
```

Note that with the y-axis, I need to invert the coordinates -- SVG coordinates start at the top left, rather than the bottom left with the graph coordinates. Leaving the coordinates as-is would cause the graph to render as being flipped vertically.

With just these, I could just inline the logic into a set of components, but instead I'll split the poin t generation out into a set of seperate functions. This means I can test that set of functions in isolation without having to worry about React at all, in effect just using the library as a rendering engine for precomputed values.

....

## Maps

## Gauges

> NOTE this is currently just a React component, need to extract the logic in the same way as with the graph to make it easier to port to different renderers (_ie_ React Native).

A gauge in this context is, given a percentage value {n}, simply a circular graphic whose line is filled by thst percentage. In the centre is some text indicating the number value.

With this, it is going to be easiest to draw if the zero coordinates are at the centre of the circle. The actual SVG viewbox size has to be a square, but other than that the size can be arbitrary -- I'll pick 64. This gives this SVG:

```jsx
<svg viewBox="-32 -32 64 64" width="100%" height="100%"></svg>
```

Then I set a stroke width that works nicely and draw an arcing path.

```jsx
<svg viewBox="-32 -32 64 64" width="100%" height="100%">
	<path d="M -20 20 A 28 28, 0, 1, 1, 20 20" stroke="black" strokeWidth="4" />
</svg>
```

It also easier if there is a default stroke width, but if that is increased, the guage will no expand beyond the viewbox. 4 works well, so use that as a base:

```tsx
const Gauge = ({ strokeWidth = 4 }) => {
	const pad = strokeWidth - 4;
	const d = `M -${20 - pad} ${20 - pad} A ${28 - pad} ${28 - pad}, 0, 1, 1, ${
		20 - pad
	} ${20 - pad}`;

	return (
		<svg viewBox="-32 -32 64 64" width="100%" height="100%">
			<path d={d} stroke="black" strokeWidth={strokeWidth} />
		</svg>
	);
};
```

Now, to add the percentage indicator, can use the dashArray attribute to fill in up to a percentage. I need to know the length of the indicator. The arc length is `circumference • (fraction of circle represented by the arc)`, then can infer the length of the indicator from there:

```ts
const arcLength: number = 2 * Math.PI * 28 * (270 / 360);

function getIndicatorLength(value: number): number {
	return arcLength * (1 - value / 100);
}
```

And to move this into the component, layer another path over the first (which will now act as a background),
and move common attributes to a grouping element:

```tsx
const Gauge = ({
	strokeWidth = 4,
	value,
}: {
	strokeWidth: number;
	value: number;
}) => {
	const arcLength: number = 2 * Math.PI * 28 * (270 / 360);
	const indicatorLength: number = getIndicatorLength(value);
	const pad = strokeWidth - 4;
	const d = `M -${20 - pad} ${20 - pad} A ${28 - pad} ${28 - pad}, 0, 1, 1, ${
		20 - pad
	} ${20 - pad}`;

	return (
		<svg viewBox="-32 -32 64 64" width="100%" height="100%">
			<g fill="none" strokeWidth={strokeWidth} strokeLinecap="round">
				<path d={d} stroke="grey" />
				<path
					d={d}
					stroke="black"
					strokeDasharray={arcLength}
					strokeDashoffset={indicatorLength}
				/>
			</g>
		</svg>
	);
};
```

Finally, there needs to be an ability to specify colour. This will be done using a function: given a value, return a colour.

```ts
(value: number) => string;
```

So, for example:

```ts
function defaultColourMapper(value: number): string {
	switch (true) {
		case value === 0:
			return "grey";
		default:
			return "black";
	}
}
```

Then pass that into the component:

```tsx
const Gauge = ({
	colourMapper = defaultColourMapper,
	strokeWidth = 4,
	value,
}: {
	strokeWidth: number;
	value: number;
}) => {
	const arcLength: number = 2 * Math.PI * 28 * (270 / 360);
	const indicatorLength: number = getIndicatorLength(value);
	const pad = strokeWidth - 4;
	const d = `M -${20 - pad} ${20 - pad} A ${28 - pad} ${28 - pad}, 0, 1, 1, ${
		20 - pad
	} ${20 - pad}`;

	return (
		<svg viewBox="-32 -32 64 64" width="100%" height="100%">
			<g fill="none" strokeWidth={strokeWidth} strokeLinecap="round">
				<path d={d} stroke={colourMapper(0)} />
				<path
					d={d}
					stroke={colourMapper(value)}
					strokeDasharray={arcLength}
					strokeDashoffset={indicatorLength}
				/>
			</g>
		</svg>
	);
};
```
