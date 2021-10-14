import React from "react";
import Account from "./icon_settings_account.svg";
import Units from "./icon_settings_ruler.svg";
import Lock from "./icon_settings_lock.svg";
import Login from "./icon_settings_login.svg";
// import Tick from "./icon_tick_white.svg";

interface ButtonImageSourcesProps {
	image: string;
	width?: number;
	style: any;
}

export const buttonImageSources = ({ image, width, style = {} }: ButtonImageSourcesProps) => {
	switch (image) {
		case "Account":
			return <Account height={`${width}px`} width={`${width}px`} style={style} />;
		case "Units":
			return <Units height={`${width}px`} width={`${width}px`} style={style} />;
		case "Lock":
			return (
				<Lock height={width ? `${width * 1.2}px` : undefined} width={`${width}px`} style={style} />
			);
		case "Login":
			return <Login height={`${width}px`} width={`${width}px`} style={style} />;
		// case "Tick":
		// 	return <Tick height={`${width}px`} width={`${width}px`} style={style} />;
		default:
			return null;
	}
};
