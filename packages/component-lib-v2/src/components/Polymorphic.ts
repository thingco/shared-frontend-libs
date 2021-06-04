/**
 * This is just lifted from https://github.com/radix-ui/primitives/tree/main/packages/react/polymorphic
 *
 * A polymorphic component to build upon.
 *
 * `stitches` own API covers most cases, but to build out compound components
 * easily requires another set of abstractions.
 */
import type * as React from "react";

/* -------------------------------------------------------------------------------------------------
 * Utility types
 * -----------------------------------------------------------------------------------------------*/
type Merge<P1 = Record<string, unknown>, P2 = Record<string, unknown>> = Omit<P1, keyof P2> & P2;

/**
 * Infers the OwnProps if E is a ForwardRefExoticComponentWithAs
 */
type OwnProps<E> = E extends ForwardRefComponent<unknown, infer P> ? P : Record<string, unknown>;

/**
 * Infers the JSX.IntrinsicElement if E is a ForwardRefExoticComponentWithAs
 */
type IntrinsicElement<E> = E extends ForwardRefComponent<infer I, unknown> ? I : never;

type NarrowIntrinsic<E> = E extends keyof JSX.IntrinsicElements ? E : never;

type ForwardRefExoticComponent<E, OwnProps> = React.ForwardRefExoticComponent<
	Merge<E extends React.ElementType ? React.ComponentPropsWithRef<E> : never, OwnProps & { as?: E }>
>;

/* -------------------------------------------------------------------------------------------------
 * ForwardRefComponent
 * -----------------------------------------------------------------------------------------------*/

interface ForwardRefComponent<
	IntrinsicElementString,
	OwnProps = Record<string, unknown>
	/**
	 * Extends original type to ensure built in React types play nice
	 * with polymorphic components still e.g. `React.ElementRef` etc.
	 */
> extends ForwardRefExoticComponent<IntrinsicElementString, OwnProps> {
	/**
	 * When `as` prop is passed, use this overload.
	 * Merges original own props (without DOM props) and the inferred props
	 * from `as` element with the own props taking precendence.
	 *
	 * We explicitly avoid `React.ElementType` and manually narrow the prop types
	 * so that events are typed when using JSX.IntrinsicElements.
	 */
	<
		As extends
			| keyof JSX.IntrinsicElements
			| React.ComponentType<unknown> = NarrowIntrinsic<IntrinsicElementString>
	>(
		props: As extends keyof JSX.IntrinsicElements
			? Merge<JSX.IntrinsicElements[As], OwnProps & { as: As }>
			: As extends React.ComponentType<infer P>
			? Merge<P, OwnProps & { as: As }>
			: never
	): React.ReactElement | null;
}

export type { ForwardRefComponent, OwnProps, IntrinsicElement, Merge };
