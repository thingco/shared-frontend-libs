import { useEffect, useState } from "react";

import { styled } from "../config";

/**
 * THIS IS EXTREMELY RAW.
 */

const GridOverlay = styled("figure", {
	backgroundSize: "$space$full $space$full",
	backgroundImage: "radial-gradient(circle at top left, $__gridDark 2px, transparent 2px)",
	position: "fixed",
	zIndex: 1,
	top: 0,
	bottom: 0,
	right: 0,
	left: 0,
	pointerEvents: "none",
	variants: {
		overlayType: {
			dotGrid: {
				backgroundSize: "$space$full $space$full",
				backgroundImage: "radial-gradient(circle at top left, $__gridDark 2px, transparent 2px)",
			},
			horizontal: {
				backgroundSize: "$space$full $space$full",
				backgroundImage: "repeating-linear-gradient($__gridLight 0 1px, transparent 1px 100%)",
			},
			horizontalSm: {
				backgroundSize: "$space$half $space$half",
				backgroundImage: "repeating-linear-gradient($__gridLight 0 1px, transparent 1px 100%)",
				opacity: 0.5,
			},
			vertical: {
				backgroundSize: "$space$full $space$full",
				backgroundImage:
					"repeating-linear-gradient(90deg, $__gridLight 0 1px, transparent 1px 100%)",
			},
			verticalSm: {
				backgroundSize: "$space$half $space$half",
				backgroundImage:
					"repeating-linear-gradient(90deg, $__gridLight 0 1px, transparent 1px 100%)",
				opacity: 0.5,
			},
		},
	},
});

const ToolsPanelContainer = styled("aside", {
	display: "flex",
	position: "absolute",
	bottom: "$space$full",
	right: "$space$full",
	padding: "$half",
	backgroundColor: "$__gridDark",
	color: "$dark",
	zIndex: 2,
});

const ToolsPanelControl = styled("div", {
	padding: "$half",
	display: "flex",
	flexDirection: "column",
});

const DESIGN_TOOLS_KEY = "@thingco_designtools";

interface GridConfig {
	dotGrid: boolean;
	hGrid: boolean;
	hGridSmall: boolean;
	vGrid: boolean;
	vGridSmall: boolean;
}

const gridConfig: GridConfig = {
	dotGrid: false,
	hGrid: false,
	hGridSmall: false,
	vGrid: false,
	vGridSmall: false,
};

function storeGridConfig(config: GridConfig): void {
	window.localStorage.setItem(DESIGN_TOOLS_KEY, JSON.stringify(config));
}

function getStoredGridConfig(defaultConfig: GridConfig = gridConfig): GridConfig {
	const storedConfig = window.localStorage.getItem(DESIGN_TOOLS_KEY);
	if (storedConfig) {
		return JSON.parse(storedConfig);
	} else {
		return defaultConfig;
	}
}

const GridConfigControl = ({
	gridType,
	isActive,
	toggleIsActive,
}: {
	gridType: keyof GridConfig;
	isActive: boolean;
	toggleIsActive: () => void;
}) => (
	<ToolsPanelControl>
		<input id={gridType} type="checkbox" checked={isActive} onChange={toggleIsActive} />
		<label htmlFor={gridType}>{gridType}</label>
	</ToolsPanelControl>
);

export const DesignTool = (): JSX.Element => {
	const [gridConfig, setGridConfig] = useState(getStoredGridConfig());

	useEffect(() => {
		storeGridConfig(gridConfig);
	}, [gridConfig]);

	return (
		<>
			{gridConfig.dotGrid && <GridOverlay overlayType="dotGrid" />}
			{gridConfig.hGrid && <GridOverlay overlayType="horizontal" />}
			{gridConfig.hGridSmall && <GridOverlay overlayType="horizontalSm" />}
			{gridConfig.vGrid && <GridOverlay overlayType="vertical" />}
			{gridConfig.vGridSmall && <GridOverlay overlayType="verticalSm" />}
			<ToolsPanelContainer>
				{Object.entries(gridConfig).map(([gridType, isActive]) => (
					<GridConfigControl
						key={gridType}
						gridType={gridType as keyof GridConfig}
						isActive={isActive}
						toggleIsActive={() =>
							setGridConfig({
								...gridConfig,
								[gridType]: !gridConfig[gridType as keyof GridConfig],
							})
						}
					/>
				))}
			</ToolsPanelContainer>
		</>
	);
};
