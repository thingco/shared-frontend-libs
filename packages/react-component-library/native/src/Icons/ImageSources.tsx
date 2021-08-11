import React from "react";
import Account from "./icon_settings_account.svg";
import Units from "./icon_settings_ruler.svg";
import Lock from "./icon_settings_lock.svg";
import Login from "./icon_settings_login.svg";

export const buttonImageSources = ({ image, style = {} }) => {
	switch (image) {
		case "Account":
			return <Account style={style} />;
		case "Units":
			return <Units style={style} />;
		case "Lock":
			return <Lock style={style} />;
		case "Login":
			return <Login style={style} />;
		default:
			return null;
	}
};
