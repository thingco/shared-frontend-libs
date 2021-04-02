import React from "react";
import { useNavigate } from "react-router-dom";
import { Link, LinkProps, ThemeUIStyleObject } from "theme-ui";

interface BodyLinkProps extends LinkProps {
	to: string;
	variant?: string;
	children: React.ReactNode;
	sx?: ThemeUIStyleObject;
}
export const BodyLink = ({
	children,
	sx = {},
	to,
	variant = "body",
}: BodyLinkProps): JSX.Element => {
	const navigate = useNavigate();

	return (
		<Link
			tabIndex={0}
			onClick={(e) => {
				e.preventDefault();
				navigate(to);
			}}
			sx={{ ...sx }}
			variant={variant}
		>
			{children}
		</Link>
	);
};
