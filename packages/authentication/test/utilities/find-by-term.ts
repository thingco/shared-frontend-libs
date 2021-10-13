import { queryAllByRole, buildQueries, screen } from "@testing-library/react";

import type { BoundFunctions, Matcher, MatcherOptions, Query } from "@testing-library/react";

/**
 * Custom matcher for testing-library APIs: "ByTerm". Given an element with the implicit
 * aria role "term" (*ie* a `<dt>` element), locate the matching element with the implicit
 * role "definition" (*ie* a `<dd>` element).
 *
 * @remarks
 * What a pain in the rear this has been. Custom queries are not particularly well documented.
 * And, ironically, that part of the testing library API doesn't seem to be particularly well
 * serviced with tests. Anyway...
 *
 * testing-library doesn't have matchers for definition lists (more specifically, finding the
 * "definition" role element for an element with role "term").
 *
 * {@link https://github.com/testing-library/dom-testing-library/issues/140 | There is an issue thread}
 * on the testing-library repo requesting them be added. But it was closed with a fairly curt "nope"
 * with respect to adding the functionality
 *
 * So *essentially*, the following code duplicates the suggestion made in that issue thread.
 *
 * IMPORTANT: this has required that a resolution be added to the root package.json to ensure
 * that the {@link https://github.com/A11yance/aria-query | aria-query package} is on
 * the latest version, which includes a fix for what looks like a regression that broke
 * "term"/"definition" functionality. `@testing-library` packages are using v4.2, whereas
 * newest version is v5.0.
 *
 * ---
 *
 * So that's the custom queries. However, those custom queries still need attached to the `screen` object.
 * So after much fighting with TypeScript, implemented a version of the code described in
 * {@link https://github.com/testing-library/dom-testing-library/issues/516 | *this* issue thread}.
 *
 * Prior art and useful links:
 *
 * - {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl | `<dl>` element docs}
 * - {@link https://w3c.github.io/aria/#term | `role="term"` specs}
 * - {@link https://w3c.github.io/aria/#definition | `role="definition"` specs}
 * - {@link https://w3c.github.io/aria/#aria-details | `aria-details` attribute specs}
 *
 * - {@link https://testing-library.com/docs/dom-testing-library/api-custom-queries | custom queries overview (not much info)}
 * - {@link https://testing-library.com/docs/react-testing-library/setup#add-custom-queries | more info on custom queries (still not much info)}
 *
 * - {@link https://github.com/lexanth/testing-library-table-queries | custom queries for `<table>`s}
 * - {@link https://gist.github.com/ikondrat/be58019ce6dfe9ab51bf72955292e28b | only custom queries Gist in TS (cursory search, mind)}
 */

/**
 * Extend the matcher options to include the `selector` field available for ByText-related queries.
 * This is useful because it means that can specify whether we want the actual term itself instead
 * of its associated description.
 */
export interface ByTermOptions extends MatcherOptions {
	selector?: string;
}

/**
 * Hack to make the element search work.
 *
 * @remarks
 * I am having severe issues getting `findByRole` to actually, y'know, "find by role" when applied
 * to a search for "term" elements with a `{ name: /regex/i }` filter applied. `{ name: string }`
 * works fine, it's the RegExp filter that's failing specifically. So if the initial query returns
 * an empty list (**WHICH MAY BE ABSOLUTELY FINE**), then will run this function which does the
 * same thing, essentially.
 *
 * @param container - the HTML element containing the DOM to be inspected
 * @param matcher   - if specified,  the queery will filter on the accessible name of the term. In other
 *                    words, the text contained in a `<dt>` element.
 */
function queryByTermFallback(container: HTMLElement, matcher?: Matcher | RegExp) {
	const dts = container.querySelectorAll("dt");
	if (matcher == undefined) {
		// NOTE: shallow clone to ensure return value of function is `HTMLElement[]` rather
		// than `NodeList<HTMLElement> | HTMLElement[]`
		return [...dts];
	} else {
		return [...dts].filter((dt) => {
			const textContent = dt.textContent?.trim();
			if (!textContent) return false;
			switch (typeof matcher) {
				case "string":
					return textContent.includes(matcher);
				case "object":
					return matcher instanceof RegExp && matcher.test(textContent);
				case "function":
					return matcher(textContent, dt);
				default:
					throw new Error(
						"Matcher must be either a string, a RegExp, or a custom matcher function"
					);
			}
		});
	}
}

/**
 * The core `ByTerm` query. Can be used as-is; the only required field is the container element.
 *
 * @remarks
 * The testing library packages export a query builder function that generates all additional
 * queries using `queryAll` as a base.
 *
 * @param container - the HTML element containing the DOM to be inspected
 * @param matcher      - if specified,  the queery will filter on the accessible name of the term. In other
 *                    words, the text contained in a `<dt>` element.
 * @param opts      - allows standard extra options to be passed + an optional "selector" value. See
 *										{@link https://testing-library.com/docs/queries/about#textmatch | from this section in the testing lib docs}.
 * @returns and array of HTML elements (possibly empty)
 */
function queryAllByTerm(
	container: HTMLElement,
	matcher?: Matcher,
	opts?: ByTermOptions
): HTMLElement[] {
	let dl_term_elements: HTMLElement[] = [];
	let dl_description_elements: HTMLElement[] = [];

	if (typeof matcher !== "number") {
		dl_term_elements = queryAllByRole(container, "term", { name: matcher });
		if (dl_term_elements.length === 0) {
			dl_term_elements = queryByTermFallback(container, matcher);
		}
	}

	if (opts?.selector === "dt" || opts?.selector === "term") {
		// If we actually want to grab the description title element, then, as with `getByText`,
		// use the "selector" property of the opts, passing in the selector, "dt"
		// REVIEW: I'm allowing the implicit aria role to be used as well.
		dl_description_elements = dl_term_elements;
	} else {
		// Otherwise, we want the associated definition.
		for (const dl_term_el of dl_term_elements) {
			// There *should* be an "aria-details" attribute on the "dt" which points to the associated "dd" element.
			const ariaDetails = dl_term_el.attributes.getNamedItem("aria-details");
			if (typeof ariaDetails === "string" && /#[a-z_][.]+/i.test(ariaDetails)) {
				// If there is, and it's definitely an ID, grab that then query for it:
				const dl_description_el = container.querySelector<"dd">(ariaDetails);
				if (dl_description_el?.nodeName === "DD") {
					// If querying on that ID returns a <dd> element, push that and carry on with the loop:
					dl_description_elements.push(dl_description_el);
					break;
				}
			}
			// If that fails, the next sibling element *should* be a "dd" (otherwise the DOM structure isn't correct):
			if (dl_term_el?.nextSibling?.nodeName === "DD") {
				dl_description_elements.push(dl_term_el.nextSibling as HTMLElement);
			}
			// It _that_ fails, not locate-able.
		}
	}

	return dl_description_elements;
}

/**
 * Required callback for the query builder to allow specifying a custom error message to show when
 * a query that should find one element finds multiple.
 *
 * @param container - the HTML element containing the DOM to be inspected
 * @param name      - the name of the element being targeted by the query
 */
function getMultipleError(_: HTMLElement, name: string) {
	return `Found multiple term elements with the name: ${name}`;
}

/**
 * Required callback for the query builder to allow specifying a custom error message to show when
 * a query fails to find a/the requested term element.
 *
 * @param container - the HTML element containing the DOM to be inspected
 * @param name      - the name of the element being targeted by the query
 */
function getMissingError(_: HTMLElement, name: string) {
	return `Unable to find a term element with the name of: ${name}`;
}

/**
 * The {@link https://testing-library.com/docs/react-testing-library/setup#add-custom-queries | `buildQueries`}
 * function constructs each required query function based on the `ByAll` function defined
 *  above + the supporting error messages.
 *
 * @remarks
 * NOTE: buildQueries returns an array of query functions, so it's in a specific order:
 * ```
 * type BuiltQueryMethods<Arguments extends any[]> = [
 *	 QueryBy<Arguments>,
 *	 GetAllBy<Arguments>,
 *	 GetBy<Arguments>,
 *	 FindAllBy<Arguments>,
 *	 FindBy<Arguments>,
 * ]
 * ```
 */
const [queryByTerm, getAllByTerm, getByTerm, findAllByTerm, findByTerm] = buildQueries(
	queryAllByTerm,
	getMultipleError,
	getMissingError
);

/**
 * Expose the custom methods as standalone queries:
 */
export const byTermQueries: { [queryName: string]: Query } = {
	queryAllByTerm,
	queryByTerm,
	getAllByTerm,
	getByTerm,
	findAllByTerm,
	findByTerm,
};

/**
 * Bind the custom queries to a custom version of the `screen` interface to
 * allow `screen.getByTerm` etc.
 */
const boundQueries = Object.entries(byTermQueries).reduce((queries, [queryName, queryFn]) => {
	return Object.assign(queries, { [queryName]: queryFn.bind(null, document.body) });
}, {} as BoundFunctions<typeof byTermQueries>);

export const customScreen = { ...screen, ...boundQueries };
