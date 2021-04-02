import React from "react";
import { useLocation, useNavigate, useResolvedPath } from "react-router-dom";
import { Link, LinkProps, ThemeUIStyleObject } from "theme-ui";

interface NavLinkProps extends LinkProps {
	to: string;
	variant?: string;
	children: React.ReactNode;
	sx?: ThemeUIStyleObject;
	testid?: string;
}
export const NavLink = ({
	children,
	sx = {},
	to,
	variant = "nav",
	testid = "nav",
}: NavLinkProps): JSX.Element => {
	const navigate = useNavigate();
	const location = useLocation();
	const pathname = location.pathname === "/" ? "/persons" : location.pathname;
	const target = useResolvedPath(to);
	const isActive = pathname === target.pathname || pathname.startsWith(target.pathname);
	const currentColor = isActive ? "accent" : "primary";

	return (
		<Link
			data-testid={testid}
			tabIndex={0}
			onClick={(e) => {
				e.preventDefault();
				navigate(target);
			}}
			sx={{ ...sx, color: currentColor }}
			variant={!isActive ? variant : "navCurrent"}
		>
			{children}
		</Link>
	);
};
