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
			return <Account height={"100px"} width={"100px"} style={style} />;
		case "Units":
			return <Units height={"100px"} width={"100px"} style={style} />;
		case "Lock":
			return <Lock height={"100px"} width={"100px"} style={style} />;
		case "Login":
			return <Login height={"100px"} width={"100px"} style={style} />;
		default:
			return null;
	}
};
