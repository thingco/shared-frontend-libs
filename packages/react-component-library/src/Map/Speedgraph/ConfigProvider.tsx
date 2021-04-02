import React from "react";

export type GraphType = "POLYLINE" | "DOT" | "LINE";
export interface SpeedgraphConfigProvider {
  graphType: GraphType;
  showRoadSpeeds: boolean;
  showSpeedGrid: boolean;
  xScale: number;
  yScale: number;
  strokeWidth: number;
}

export interface SetSpeedgraphConfig {
  setGraphType: (graphType: GraphType) => void;
  setShowRoadSpeeds: (showRoadSpeeds: boolean) => void;
  setShowSpeedGrid: (showSpeedGrid: boolean) => void;

  setXScale: (xScale: number) => void;
  setYScale: (yScale: number) => void;
  setStrokeWidth: (strokeWidth: number) => void;
}

const ConfigContext = React.createContext<SpeedgraphConfigProvider>({
  graphType: "POLYLINE",
  showRoadSpeeds: true,
  showSpeedGrid: true,
  xScale: 4,
  yScale: 4,
  strokeWidth: 2,
});

const SetConfigContext = React.createContext<SetSpeedgraphConfig>({
  setGraphType: (_) => void 0,
  setShowRoadSpeeds: (_) => void 0,
  setShowSpeedGrid: (_) => void 0,
  setXScale: (_) => void 0,
  setYScale: (_) => void 0,
  setStrokeWidth: (_) => void 0,
});

export type SpeedgraphConfigProviderProps = Partial<
  SpeedgraphConfigProvider
> & { children: React.ReactNode };

export const SpeedgraphConfigProvider = ({
  children,
  graphType: initGraphType = "POLYLINE",
  showRoadSpeeds: initShowRoadSpeeds = true,
  showSpeedGrid: initShowSpeedGrid = true,
  xScale: initXScale = 8,
  yScale: initYScale = 4,
  strokeWidth: initStrokeWidth = 2,
}: SpeedgraphConfigProviderProps): JSX.Element => {
  const [graphType, setGraphType] = React.useState<GraphType>(
    () => initGraphType
  );
  const [showRoadSpeeds, setShowRoadSpeeds] = React.useState<boolean>(
    () => initShowRoadSpeeds
  );
  const [showSpeedGrid, setShowSpeedGrid] = React.useState<boolean>(
    () => initShowSpeedGrid
  );
  const [xScale, setXScale] = React.useState<number>(() => initXScale);
  const [yScale, setYScale] = React.useState<number>(() => initYScale);
  const [strokeWidth, setStrokeWidth] = React.useState<number>(
    () => initStrokeWidth
  );

  return (
    <SetConfigContext.Provider
      value={{
        setGraphType,
        setShowRoadSpeeds,
        setShowSpeedGrid,
        setXScale,
        setYScale,
        setStrokeWidth,
      }}
    >
      <ConfigContext.Provider
        value={{
          graphType,
          showRoadSpeeds,
          showSpeedGrid,
          xScale,
          yScale,
          strokeWidth,
        }}
      >
        {children}
      </ConfigContext.Provider>
    </SetConfigContext.Provider>
  );
};

/**
 *
 */
export function useSpeedgraphConfig(): SpeedgraphConfigProvider {
  const controls = React.useContext(ConfigContext);
  if (!ConfigContext) {
    throw new Error(
      "useSpeedgraphConfig hook may only be used from within a SpeedgraphControls provider."
    );
  }
  return controls;
}
/**
 *
 */
export function useSetSpeedgraphConfig(): SetSpeedgraphConfig {
  const controls = React.useContext(SetConfigContext);
  if (!SetConfigContext) {
    throw new Error(
      "useSetSpeedgraphConfig hook may only be used from within a SpeedgraphControls provider."
    );
  }
  return controls;
}
