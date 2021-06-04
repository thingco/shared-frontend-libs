# Create a set of UI icons

## Overview

Given a folder full of SVG icons, generate a set of React components specific to
the component library (_ie_ they are theme-aware).

There are other options rather than quite painstakingly building icons using
a quite fragile script. But the advantage of this is that the output is a set of
fully stylable and controllable components. More difficult to create, but much
easier to work with once created: they are just React components, same as any
other component.

NOTE that this is hacked together from disparate modules and makes several
passes. It's not quick and it's not pretty.

## Running the script

From repo root, run

`yarn runscript ./scripts/create-icons.md`

The `srcdir` and `outdir` args can be passed in at this point, though if they
are not defined then the script will ask for them to be entered.

`yarn runscript ./scripts/create-icons.md --srcdir=./path/to/in/dir --outdir=./path/to/out/dir`

The `dryrun` flag can also be passed at this point, which will cause the script
to just log the result rather than actually writing anything to disk.

`yarn runscript ./scripts/create-icons.md --dryrun`

## Imports

```js
import { optimize } from "svgo";
import { xml2js, js2xml } from "xml-js";
import * as path from "path";
```

## Utils

```js
const initialCap = (str) => str[0].toUpperCase() + str.slice(1);
const kebab2camel = (str) =>
	str
		.split("-")
		.map((subStr, i) => (i === 0 ? subStr : initialCap(subStr)))
		.join("");
const kebab2pascal = (str) => initialCap(kebab2camel(str));
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
  of 2 units spaced 2 units apart _(**REVIEW**: if this is too light, drop the space
  to 1 unit)_.

### What are we transforming to?

The library backing the React _web_ UI is called [stitches](https://stitches.dev).
It uses a `styled` API to define components, CSS-in-JS. It has a few nice
properties, primary amongst which is the ability to define _design tokens_ in
a theme -- names values for things like colours and sizes, which are then
automatically picked up in the styled components by prefixing the names with
`$` -- for example in my theme, I might have `colors: { mySpecialColor: #abcdef,`
then do `const MySpecialText = styled("p", { color: "$mySpecialColor"})`. Useful,
anyway, for a project where white labelling is important.

## Preparing to parse

We need three things to start off with:

1. The input directory constaining the SVGs -- call this `srcdir` in args.
2. The output directory -- call this `outdir` in args.
3. Whether this is a dry run -- call this `dryrun` in args.

How do I get values for these? Well, I check for command-line arguments first:

```js
let argv = (() => {
	let parsedArgs = {};

	for (let arg of process.argv) {
		switch (true) {
			case /^--[a-z0-9-_]+=.+$/i.test(arg):
				let [_, key, value] = arg.match(/^--([a-z0-9-_]+)=(.+)$/i);
				parsedArgs[key] = `${value}`;
				break;
			case /^--[a-z0-9-_]+$/i.test(arg):
				let booleanKey = arg.slice(2);
				parsedArgs[booleanKey] = true;
				break;
			default:
				continue;
		}
	}

	return parsedArgs;
})();
```

I can ask questions later if anything is missing.

### Rules of parsing icons

- The icons should all be in a single flat directory (subdirectories will be
  ignored).
- Each icon should be in its own SVG file.
- The file name is going to be the icon name (so no "Artboard 1" please).
- That filename should be kebab-cased, otherwise you'll get weird names.

### Parsing to and walking an AST

#### Optimisation step

This runs the [SVGO](https://github.com/svg/svgo) optimiser over the SVG.

```js
function optimizeSvg(rawSvg) {
	let config = {
		plugins: [
			"cleanupAttrs",
			"removeDoctype",
			"removeXMLNS",
			"removeXMLProcInst",
			"removeComments",
			"removeMetadata",
			"removeTitle",
			"removeDesc",
			"removeUselessDefs",
			"removeEditorsNSData",
			"removeEmptyAttrs",
			"removeHiddenElems",
			"removeEmptyText",
			"removeEmptyContainers",
			// "removeViewBox",
			"cleanupEnableBackground",
			"convertStyleToAttrs",
			"convertColors",
			"convertPathData",
			"convertTransform",
			"removeUnknownsAndDefaults",
			"removeNonInheritableGroupAttrs",
			"removeUselessStrokeAndFill",
			"removeUnusedNS",
			"cleanupIDs",
			"cleanupNumericValues",
			"moveElemsAttrsToGroup",
			"moveGroupAttrsToElems",
			"collapseGroups",
			"removeRasterImages",
			"mergePaths",
			"convertShapeToPath",
			"sortAttrs",
			"removeDimensions",
		],
	};
	let { data } = optimize(rawSvg, config);
	return data;
}
```

#### Conversion to AST step

This takes the output of SVG optimisation and hands it to [xml-js](https://github.com/nashwaan/xml-js)'
`xml2js` function, which will return an AST.

What I want here is the collection of actual elements within the containing `<svg>`.
I have control over the containing elements -- the `svg`, `title` and a `g`
element defining the base styling -- so it is only the actual elements I need
to walk.

```js
function svgToElementCollection(optimizedSvg) {
	let ast = xml2js(optimizedSvg, { nativeType: true });

	// Sanity check: is it going to be possible to read this data?
	let hasSvgRoot = ast.elements?.[0]?.name === "svg";
	let svgRootHasChildren =
		ast.elements?.[0]?.elements?.filter(({ name }) => name === "title")?.length > 0;

	if (!hasSvgRoot && !svgRootHasChildren) {
		// prettier-ignore
		throw new Error(`There should be a node with "name": "svg" and "type": "element" as the first child of the root. That node should have at least one non-title child element. This is not the case: ${JSON.stringify(ast)}`);
	}
	// Now know can reach the "svg" element node...
	let svgRoot = ast.elements[0];
	// ...so look at the actual elements, ignoring the "title" node:
	let svgRootElements = svgRoot.elements;

	if (svgRootElements.length === 1 && svgRootElements[0].name === "g") {
		// It has a containing grouping element. This is already extant in the
		// template the AST will be inserted into, so drill further:
		return svgRootElements[0].elements;
	} else {
		return svgRootElements;
	}
}
```

#### Walking and transforming the AST nodes

The walk is the most important step.

I'm looking for an end structure like:

    //	<LineIcon whitelistedAttributes css{height/width}>
    //		<LineIcon.Title><Title/>
    //		<LineIcon.G css{defaults}>
    //			<LineIcon.Element whitelistedAttributes />
    //			<LineIcon.Element whitelistedAttributes />
    //			<LineIcon.Element whitelistedAttributes css{someAttributeThatOverridesDefault} />
    //		</LineIcon.G>
    //	</LineIcon>

It needs to achieve several tasks:

Firstly, if any attributes match the _key_ of one of the default attributes, but
not the value, then that indicates that attribute is an exception -- it has to
be kept. The most obvious candidate here is thin strokes. There is a default
stroke width (4), but there is also a thin stroke width (2) for details. If the
stroke width on the attribute _is_ 2, then I do not want it removed.

So, based on the rules of icons, there are a set of defaults that are applied
to each icon:

```js
const PRESENTATIONAL_ATTRIBUTES = {
	"stroke-width": "4",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
};
```

And to map this to defaults:

```js
function presentationalAttributeKeyToVariant(attributeKey) {
	return {
		"stroke-width": "weight",
		"stroke-linecap": "linecap",
		"stroke-linejoin": "linejoin",
	}[attributeKey];
}
```

These are going to be [variants](https://stitches.dev/docs/variants). They'll
map to `weight` (default: 4), `linecap` (default: "round") and `linejoin`
(default: "round"). _(**REVIEW**: circle radius is also styleable, and it defaults
to 2, can we get that in)_

So you end up with something like:

`<Circle cx="32" cy="17" r="2" weight="thin"/>`
`<Line x1="16" y1="10" x2="16" y2="54" weight="2"/>`

Secondly, remove any attributes that are not on a whitelist. Critical core
attributes (as rule all those describing actual coordinates) cannot be maniputaled
via styles. So anything on the attribute whitelist is passthrough, and must be
kept. **This is where things are most likely to mess up.**

```js
const ATTRIBUTE_WHITELIST = /^(viewBox|x|y|x1|y1|x2|y2|points|cx|cy|rx|ry|r|d)$/;
```

The core function, the transformer. This takes an array of element nodes,
converts their name to the format I'll be using and maps/filters the attributes

```js
function transformElement(element) {
	let name = `LineIcon.${element.name[0].toUpperCase() + element.name.slice(1)}`;

	if (!element.attributes || !Object.keys(element.attributes).length) {
		return {
			...element,
			name,
		};
	}

	let attrMap = Object.entries(element.attributes);
	let attributes = {};

	for (let [k, v] of attrMap) {
		switch (true) {
			case ATTRIBUTE_WHITELIST.test(k):
				attributes[k] = v;
				break;
			case k in PRESENTATIONAL_ATTRIBUTES && PRESENTATIONAL_ATTRIBUTES[k] !== v:
				attributes[presentationalAttributeKeyToVariant(k)] = v;
				break;
			default:
				continue;
		}
	}

	return {
		...element,
		name,
		attributes,
	};
}
```

The walker applies the transformer function to all nodes recursively.

```js
function walkElements(elements) {
	let rebuiltElements = [];

	for (let el of elements) {
		let rebuiltEl = transformElement(el);
		let hasChildren = rebuiltEl.elements?.length > 0;
		rebuiltElements.push(hasChildren ? walkElements(rebuiltEl.elements) : rebuiltEl);
	}

	return rebuiltElements;
}
```

Finally, the function that will actually be ran produces the AST structure of the
icon.

```js
function buildAst(elements) {
	return {
		type: "element",
		name: "LineIcon.Svg",
		attributes: {
			viewBox: "0 0 64 64",
			role: "img",
		},
		elements: [
			{
				type: "element",
				name: "LineIcon.Title",
				elements: [
					{
						type: "text",
						text: "{ props.title }",
					},
				],
			},
			{
				type: "element",
				name: "LineIcon.BaseWrapper",
				elements: walkElements(elements),
			},
		],
	};
}
```

### Code generation

The code generation stage builds the icon file. Start with imports:

```js
let imports = `
import { StitchesComponentWithAutoCompleteForJSXElements } from "@stitches/react";
`;
```

For web, I can wrap all the primitives in `styled` to allow all the presentational
attributes to be passed in that way and variants to be defined:

```js
let styledBuildingBlocks = `
const Circle = styled("circle", {});
const Ellipse = styled("ellipse", {});
const G = styled("g", {});
const Line = styled("line", {});
const Path = styled("path", {});
const Polygon = styled("polygon", {});
const Polyline = styled("polyline", {});
const Rect = styled("rect", {});
const Svg = styled("svg", {});
`;
```

Then I compose those primitives to make them line-icon-specific. Note that I'm
moving the default stroke properties to variants. This isn't immediately useful,
but going forward, is a starting point to allowing me to adjust the stroke
properties at a theme level.

```js
let lineIconBase = `
interface LineIconProps {
	title: string;
	// strokeScaling?: "constrained";
}

const strokeVariants = {
	variants: {
		weight: {
			"2": { strokeWidth: "2" },
			"4": { strokeWidth: "4" },
		},
		linecap: {
			butt: { strokeLinecap: "butt" },
			round: { strokeLinecap: "round" },
			square: { strokeLinecap: "square" },
		},
		linejoin: {
			arcs: { strokeLineJoin: "arcs"},
			bevel: { strokeLineJoin: "bevel"},
			miter: { strokeLineJoin: "miter"},
			"miter-clip": { strokeLineJoin: "miter-clip"},
			round: { strokeLineJoin: "round"},
		}
	},
	defaultVariants: {
		weight: "4",
		linecap: "round",
		linejoin: "round",
	}
}

const LineIcon: Record<
	string,
	StitchesComponentWithAutoCompleteForJSXElements<unknown, typeof strokeVariants>
> = {};

LineIcon.Svg = styled(Svg, {
	display: "block",
    pointerEvents: "none",
});

LineIcon.BaseWrapper = styled(G, {
	fill: "none",
	stroke: "currentColor",
    vectorEffect: "none",
	variants: {
		strokeScaling: {
			constrained: {
				vectorEffect: "non-scaling-stroke",
			},
		},
	}
});

LineIcon.G = styled(G, {});

LineIcon.Circle = styled(Circle, { ...strokeVariants });
LineIcon.Ellipse = styled(Ellipse, { ...strokeVariants });
LineIcon.Line = styled(Line, { ...strokeVariants });
LineIcon.Path = styled(Path, { ...strokeVariants });
LineIcon.Polygon = styled(Polygon, { ...strokeVariants });
LineIcon.Polyline = styled(Polyline, { ...strokeVariants });
LineIcon.Rect = styled(Rect, { ...strokeVariants });
`;
```

Finally, I define a template to insert the output of the ast->XML transformation:

```js
function generateIcon(name, xmlString) {
	return `
export const LineIcon${name} = (props: LineIconProps): JSX.Element => (
	${xmlString}
);
`;
}
```

Once an AST has been generated, can generate the code. `xml-js` provides the
base for this via the `js2xml` function that can be applied to the AST.

## Parse

We might be missing `srcdir`, `outdir` and/or the `dryrun` flag. If we are, we
need to remedy that. For the directories, ask the user. For the `--dryrun` flag,
if it was passed to the script it's a dry run, if it wasn't then it isn't.

```js
argv.srcdir = argv.srcdir ?? (await question("Please specify a path to the source directory: "));
argv.outdir = argv.outdir ?? (await question("Please specify a path to the output directory: "));
argv.dryrun = argv.dryrun ?? false;
```

```js
let files = await fs.readdir(argv.srcdir);
let outputFileData = [styledBuildingBlocks, lineIconBase];

for (let file of files) {
	if (path.extname(file) === ".svg") {
		let componentName = kebab2pascal(path.basename(file, ".svg"));

		let raw = await fs.readFile(path.join(argv.srcdir, file), { encoding: "utf8" });
		console.log("\n\n-----> 1. Raw: \n\n", raw);
		let optimized = optimizeSvg(raw);
		console.log("\n\n-----> 2. Optimized: \n\n", optimized);
		let elements = svgToElementCollection(optimized);
		console.log("\n\n-----> 3. Elements: \n\n", JSON.stringify(elements, null, 2));
		let ast = buildAst(elements);
		console.log("\n\n-----> 4. AST: \n\n", JSON.stringify(ast, null, 2));
		let xml = js2xml({ elements: [ast] }, { spaces: "\t" });
		console.log("\n\n-----> 5. XML: \n\n", xml);
		let component = generateIcon(componentName, xml);
		console.log("\n\n-----> 6. Component: \n\n", component);
		outputFileData.push(component);
	}
}

if (argv.dryrun === false) {
	let outfile = path.join(argv.outdir, "LineIcons.tsx");

	// FIXME HARDCODED PATH TO CONFIG FILE
	outputFileData.unshift(
		imports,
		`import { styled } from "../config";
`
	);
	await fs.writeFile(outfile, outputFileData.join("\n"));
} else {
	console.log(outputFileData.join("\n"));
}
```
