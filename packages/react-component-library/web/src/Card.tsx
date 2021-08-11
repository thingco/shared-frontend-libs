import React from "react";
import { Card as ThemeUICard, CardProps as ThemeUICardProps, ThemeUIStyleObject } from "theme-ui";

import { Body, CardBodyProps } from "./Card/Body";
import { CardFooterProps, Footer } from "./Card/Footer";
import { CardHeaderProps, Header } from "./Card/Header";

export interface ICard extends React.FC {
	Body: React.FC<CardBodyProps>;
	Footer: React.FC<CardFooterProps>;
	Header: React.FC<CardHeaderProps>;
}

export interface CardProps extends ThemeUICardProps {
	/** The card's internal elements, for example `<Card.Body>` */
	children?: React.ReactNode;
	onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
	variant?: string;
	sx?: ThemeUIStyleObject;
	testid?: string;
}

export const Card = ({
	children,
	onClick = undefined,
	variant = "primary",
	sx = {},
	testid = "card",
}: CardProps): JSX.Element => (
	<ThemeUICard data-testid={testid} as="section" onClick={onClick} variant={variant} sx={sx}>
		{children}
	</ThemeUICard>
);

Card.Body = Body;
Card.Footer = Footer;
Card.Header = Header;
