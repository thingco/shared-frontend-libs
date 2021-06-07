import { useEffect, useState } from "react";

import { LineIcon } from "../components";
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
	padding: "$quarter",
	backgroundColor: "$__gridDark",
	color: "$dark",
	zIndex: 2,
});

const ToolsPanelControl = styled("div", {
	display: "flex",
	flexDirection: "column",
});

const ToolsPanelButton = styled("label", {
	color: "$dark",
	display: "flex",
	padding: "$quarter",
	height: "calc($space$full + $space$half)",
	width: "calc($space$full + $space$half)",
});

const DESIGN_TOOLS_KEY = "@thingco_designtools";

interface GridConfig {
	gridDot: boolean;
	gridHorizontalHeavy: boolean;
	gridHorizontalLight: boolean;
	gridVerticalHeavy: boolean;
	gridVerticalLight: boolean;
}

const gridConfig: GridConfig = {
	gridDot: false,
	gridHorizontalHeavy: false,
	gridHorizontalLight: false,
	gridVerticalHeavy: false,
	gridVerticalLight: false,
};

const gridIcon = (gridType: keyof GridConfig): JSX.Element => {
	switch (gridType) {
		case "gridDot":
			return <LineIcon icontype="GridDot" title="Toggle dot grid" />;
		case "gridHorizontalHeavy":
			return <LineIcon icontype="GridHorizontalHeavy" title="Toggle heavy horizontal grid" />;
		case "gridHorizontalLight":
			return <LineIcon icontype="GridHorizontalLight" title="Toggle light horizontal grid" />;
		case "gridVerticalHeavy":
			return <LineIcon icontype="GridVerticalHeavy" title="Toggle heavy vertical grid" />;
		case "gridVerticalLight":
			return <LineIcon icontype="GridVerticalLight" title="Toggle light vertical grid" />;
	}
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
		<ToolsPanelButton htmlFor={gridType}>{gridIcon(gridType)}</ToolsPanelButton>
	</ToolsPanelControl>
);

export const DesignTool = (): JSX.Element => {
	const [gridConfig, setGridConfig] = useState(getStoredGridConfig());

	useEffect(() => {
		storeGridConfig(gridConfig);
	}, [gridConfig]);

	return (
		<>
			{gridConfig.gridDot && <GridOverlay overlayType="dotGrid" />}
			{gridConfig.gridHorizontalHeavy && <GridOverlay overlayType="horizontal" />}
			{gridConfig.gridHorizontalLight && <GridOverlay overlayType="horizontalSm" />}
			{gridConfig.gridVerticalHeavy && <GridOverlay overlayType="vertical" />}
			{gridConfig.gridVerticalLight && <GridOverlay overlayType="verticalSm" />}
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
