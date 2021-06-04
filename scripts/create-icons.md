# Create a set of UI icons

Given a folder full of SVG icons, generate a set of React components specific to
the component library (_ie_ they are theme-aware).

There are other options rather than quite painstakingly building icons using
a quite fragile script. But the advantage of this is that the output is a set of
fully stylable and controllable components. More difficult to create, but much
easier to work with once created: they are just React components, same as any
other component.

## Running the script

From repo root, run

`yarn runscript ./scripts/create-icons.md`

## Imports

```js
import { optimize } from "svgo";
import { xml2js, js2xml } from "xml-js";

import * as path from "path";
```

## Rules of icons

Following rules are mandatory:

- The icons used for ThingCo are all single-colour line icons.
- They are all 64 by 64 units.
- They should have no specified width/height, allowing the width/height to
  be defined at component level.

Following rules are recommended. Because the script assumes them, any deviation
from the rules will require tweaking of the output:

- They have a combination of thick and thin strokes.
- They have rounded corners and terminals.
- The primary stroke should be 4 units: most of the icon should be drawn using
  this stroke width.
- Secondary strokes (used for detailing) should be 2 units.
- No fills. If a fill is needed, use a diagonal halftone pattern
  of 2 units spaced 2 units apart \_(REVIEW: if this is too light, drop the space
  to 1 unit).

Based on the above, there are a set of defaults that can be applied to each icon.

```js
const DEFAULTS = {
	fill: "none",
	stroke: "#000",
	strokeWidth: "4",
	strokeLinecap: "round",
	strokeLinejoin: "round",
};
```

### DANGER AREA

Anything on the whitelist is passthrough, and must be kept. This is where things
are most likely to mess up, and this needs careful testing.

```js
const ATTRIBUTE_KEY_WHITELIST = /^(viewBox|x|y|x1|y1|x2|y2|points|cx|cy|rx|ry|r|d)$/;
```

Anything that has the same attribute key as a default but a different value,
keep it. Otherwise it's going to already be defined, so dump it.

### File template

The library backing the React _web_ UI is called [stitches](https://stitches.dev).
It uses a `styled` API to define components.

The end result of this script is a file containing all the icons. In that file,
I'm defining a few base components, using `stitches` CSS-in-JS syntax. They
will then be reused in the generated icons.

As well as this, I create a `<g>` element to apply the default attributes,
and an SVG element specifically for icons.

```js
const iconFileTemplate = `
import { styled } from "../config";

export const Circle = styled("circle", {});
export const Ellipse = styled("ellipse", {});
export const G = styled("g", {});
export const Line = styled("line", {});
export const Path = styled("path", {});
export const Polygon = styled("polygon", {});
export const Polyline = styled("polyline", {});
export const Rect = styled("rect", {});
export const Svg = styled("svg", {});

export const IconBaseElement = styled(G, {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "$iconStrokeWidth",
	strokeLinecap: "round",
	strokeLinejoin: "round",
    vectorEffect: "none",
    variants: {
        scaleStrokes: {
            true: {
                vectorEffect: "non-scaling-stroke"
            },
        },
    },
});

export const IconSvg = styled("svg", {
    display: "block",
    pointerEvents: "none",
    variants: {
        size: {
            responsive: {
                height: "100%",
                width: "100%",
            },
			text: {
				height: "1em",
				width: "1em",
			},
            xs: {
                height: "$iconSizeXs", 
                width: "$iconSizeXs",
            },
            s: {
                height: "$iconSizeS",
                width: "$iconSizeS",
            },
            m: {
                height: "$iconSizeM",
                width: "$iconSizeM",
            },
            l: {
                height: "$iconSizeL",
                width: "$iconSizeL",
            }
        },
    },
    defaultVariants: {
        size: "text",
    }
});

interface IconProps {
	color?: string;
    size?: "responsive" | "text" | "xs" | "s" | "m" | "l";
    strokeWidth?: number;
    strokeWidthThin?: number;
    scaleStrokes?: boolean;
};
`;
```

---

## Rules of parsing icons

- The icons should all be in a single flat directory (subdirectories will be
  ignored).
- Each icon should be in its own SVG file.
- The file name is going to be the icon name (so no "Artboard 1" please).
- That filename should be kebab-cased, otherwise you'll get wierd names.

### Compiling the icons for use in the shared libraries

Get the input/output paths.

_TODO I want tab autocompletion here._

```js
let inputDirPath = "/Users/daniel.couper/Work/ILLUSTRATOR/thingco-icons";
let outputDirPath = "./packages/component-lib-v2/src/components";
// let inputDirPath = await question("Please specify a path to the source directory: ");
// let outputDirPath = await question("Please specify a path to the output directory: ");
let isDryRun = await question("Is this a dry run? (just hit enter to skip)");
isDryRun = isDryRun.toLowerCase()[0] === "y";
```

Define a function for transforming the attributes object of each node. Not so
simple, this is where the core logic is happening. Basically, we have an object
(`attributes`). We need to iterate through it and produce a transformed version
where:

1. all attribute keys are camelCased.
2. any styleable attributes (colours and stroke widths for example) are extracted
   to a new attribute, `css`, which is the theme-aware prop stitches provides.
   These styleable attributes are defined under `DEFAULTS`, so need to check
   if a key matches one of those
3. any

```js
function transformElementAttributes(attributes) {
	let currentAttributes = Object.entries(attributes);
	let transformedAttributes = [];
	let cssStyleableAttributes = [];

	for (let [key, value] of currentAttributes) {
		let camelKey = kebabToCamelCase(key);

		if (camelKey in DEFAULTS) {
			if (value === DEFAULTS[camelKey]) {
				continue;
			} else if (camelKey === "strokeWidth" && +DEFAULTS.strokeWidth % +value == 2) {
				cssStyleableAttributes.push([camelKey, '"$iconStrokeWidthThin"']);
			} else {
				console.warn(
					`The ${camelKey} attribute didn't match that in the defaults. The value won't be converted to a theme token and will be added as-is, so there is likely some manual work needed on this icon. Attribute default: ${JSON.stringify(
						DEFAULTS[camelKey]
					)}. Received value: ${JSON.stringify(value)}`
				);
				cssStyleableAttributes.push([camelKey, value]);
			}
		} else if (ATTRIBUTE_KEY_WHITELIST.test(camelKey)) {
			transformedAttributes.push([camelKey, value]);
		}
	}

	if (cssStyleableAttributes.length > 0) {
		transformedAttributes.push([
			"css",
			`{{ ${cssStyleableAttributes.map(([k, v]) => String.raw`${k}: ${v}`).join(", ")} }}`,
		]);
	}

	return Object.fromEntries(transformedAttributes);
}
```

Define a function to wrap the `xml2js` call. What we need to do with the output
is enhance the structure slightly so that we can just convert it straight back
to a pseudo-XML representation (the JSX that will be the component definition).

```js
const xml2jsOptions = {
	attributesFn: transformElementAttributes,
	elementNameFn: capitalise,
	nativeType: true,
};

function parseSvg(svg, filename) {
	let { data } = optimize(svg);
	let ast = xml2js(data, xml2jsOptions);

	// Add attributes to the root SVG node:
	const rootNode = ast.elements[0];
	if (rootNode.name !== "Svg") {
		throw new Error(`The root node should be an element with the name "Svg"`);
	}

	rootNode.name = "IconSvg";
	rootNode.attributes = {
		viewBox: "0 0 64 64",
		size: "{ size }",
	};
	// Insert a `title` node and wrap the remaining child elements in the
	// default `<g>` element
	rootNode.elements = [
		{
			type: "element",
			name: "title",
			elements: [
				{
					type: "text",
					text: `Icon: ${kebabToWords(filename)}`,
				},
			],
		},
		{
			type: "element",
			name: "IconBaseElement",
			attributes: {
				css: "{{ color, strokeWidth, strokeWidthThin }}",
				scaleStrokes: "{ scaleStrokes }",
			},
			elements: rootNode.elements,
		},
	];

	// Oh ffs!
	function stripEmptyGs(node) {
		const hasChildren = "elements" in node && node.elements.length > 0;

		if (hasChildren) {
			const rebornChildren = [];
			for (let child of node.elements) {
				const childIsUselessG =
					child.name === "G" && (!child.attributes || Object.keys(child.attributes).length === 0);
				if (childIsUselessG) {
					rebornChildren.push(...(child.elements ?? []));
				} else {
					rebornChildren.push(child);
				}
			}
			node.elements = rebornChildren;
			if (rebornChildren.length > 0) {
				for (let child of rebornChildren) {
					stripEmptyGs(child);
				}
			}
		}
		return node;
	}

	return stripEmptyGs(ast);
}
```

Define a function to wrap the `js2xml` function. With this, we take the output
of the last function and convert it back to a pseudo-XML representation. Then
we dump that into a template as the component.

```js
function writeJsx(ast, componentName) {
	let jsx = js2xml(ast);

	return `
const ${componentName} = ({
    color = "currentColor",
    size = "text",
    strokeWidth = 4,
    strokeWidthThin = 2,
    scaleStrokes = false,
}: IconProps): JSX.Element => (
    ${jsx}
);
`;
}
```

Then cycle through the inputs, appending them to the file template

```js
let files = await fs.readdir(inputDirPath);
let output = [iconFileTemplate];
let componentNames = [];

for (let file of files) {
	if (path.extname(file) === ".svg") {
		let svgContents = await fs.readFile(path.join(inputDirPath, file), { encoding: "utf8" });
		let fileName = path.basename(file, ".svg");
		let componentName = kebabToPascalCase(fileName);
		componentNames.push(componentName);
		let ast = parseSvg(svgContents, fileName);
		let jsx = writeJsx(ast, componentName).replaceAll('"{', "{").replaceAll('}"', "}");
		output.push(jsx);
	}
}

output.push(`
export const LineIcon = {
	${componentNames.join(",\n")}
};
`);

output = output.join("");

if (!isDryRun) {
	await fs.writeFile(path.join(outputDirPath, "LineIcons.tsx"), output);
} else {
	console.log(output);
}
```

## Utility functions

Some utility functions for processing the attributes:

```js
function capitalise(str) {
	return str[0].toUpperCase() + str.slice(1);
}

function kebabToCamelCase(str = "MISSING-VALUE") {
	return str
		.split("-")
		.map((subStr, i) => (i === 0 ? subStr : capitalise(subStr)))
		.join("");
}

function kebabToPascalCase(str) {
	return `${str[0].toUpperCase()}${kebabToCamelCase(str.slice(1))}`;
}

function kebabToWords(str) {
	return str.replace(/-/g, " ");
}

function stringifyObj(obj) {
	return `{{ ${Object.entries(obj).reduce((acc, [k, v]) => `${k}: \"${v}\", ${acc} `)} }}`;
}
```
