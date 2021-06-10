import { InternalCSS } from "@stitches/react";
import { ReactNode } from "react";

import { styled } from "../config";

const StyledCardContainer = styled("section", {
	backgroundColor: "$light",
	borderRadius: "$12",
	border: "2px solid $dark",
	display: "flex",
	overflow: "hidden",
	variants: {
		orientation: {
			vertical: {
				flexDirection: "column",
			},
			horizontal: {
				flexDirection: "row",
			},
		},
	},
	defaultVariants: {
		orientation: "vertical",
	},
});

const StyledCardHeader = styled("header", {
	borderBottom: "2px solid $dark",
	display: "flex",
	justifyContent: "flex-start",
	padding: "$half",
});

const StyledCardBody = styled("div", {
	flex: 1,
	padding: "$half",
	variants: {
		layout: {
			grid: {
				display: "grid",
				gap: "$half",
			},
			flex: {
				display: "flex",
				gap: "$half",
			},
			flexWrap: {
				display: "flex",
				flexWrap: "wrap",
				gap: "$half",
				alignItems: "flex-start",
			},
		},
	},
});

const StyledCardFooter = styled("footer", {
	borderTop: "2px solid $dark",
	display: "flex",
	padding: "$half",
});

interface CardProps {
	children: ReactNode;
	columns?: number;
	css?: InternalCSS;
	orientation?: "horizontal" | "vertical";
}

export const Card = ({ children, columns, orientation = "vertical" }: CardProps): JSX.Element => (
	<StyledCardContainer orientation={orientation} css={{ gridColumn: `span ${columns}` }}>
		{children}
	</StyledCardContainer>
);

Card.Header = StyledCardHeader;
Card.Body = StyledCardBody;
Card.Footer = StyledCardFooter;

const StyledCardStack = styled(StyledCardContainer, {
	border: "none",
	borderRadius: 0,
	display: "grid",
	gridTemplateColumns: "100%",
	gridAutoRows: "min-content",
	rowGap: "$half",
});

export const CardStack = ({ children, columns }: CardProps): JSX.Element => (
	<StyledCardStack css={{ gridColumn: `span ${columns}` }}>{children}</StyledCardStack>
);
