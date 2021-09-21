import React from "react";
import Account from "./icon_settings_account.svg";
import Units from "./icon_settings_ruler.svg";
import Lock from "./icon_settings_lock.svg";
import Login from "./icon_settings_login.svg";

interface ButtonImageSourcesProps {
	image: string;
	style: any;
}

export const buttonImageSources = ({ image, style = {} }: ButtonImageSourcesProps) => {
	switch (image) {
		case "Account":
			return <Account viewBox={`0 0 100 100`} style={style} />;
		case "Units":
			return <Units viewBox={`0 0 100 100`} style={style} />;
		case "Lock":
			return <Lock viewBox={`0 0 100 100`} style={style} />;
		case "Login":
			return <Login viewBox={`0 0 100 100`} style={style} />;
		default:
			return null;
	}
};
