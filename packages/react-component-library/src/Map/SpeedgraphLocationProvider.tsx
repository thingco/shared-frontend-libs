import React from "react";

interface MapSpeedgraphLocationContextValues {
  selectedSpeedgraphLocation: number;

  setSelectedSpeedgraphLocation: (selectedSpeedgraphLocation: number) => void;
}

export const MapSpeedgraphLocationContext = React.createContext<
  MapSpeedgraphLocationContextValues
>({
  selectedSpeedgraphLocation: 0,
  setSelectedSpeedgraphLocation: () => void 0,
});

export const MapSpeedgraphLocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [
    selectedSpeedgraphLocation,
    setSelectedSpeedgraphLocation,
  ] = React.useState<number>(0);

  return (
    <MapSpeedgraphLocationContext.Provider
      value={{
        selectedSpeedgraphLocation,
        setSelectedSpeedgraphLocation,
      }}
    >
      {children}
    </MapSpeedgraphLocationContext.Provider>
  );
};

/**
 *
 */
export function useMapSpeedgraphLocation(): MapSpeedgraphLocationContextValues {
  const locationState = React.useContext(MapSpeedgraphLocationContext);
  if (!MapSpeedgraphLocationContext) {
    throw new Error(
      "`useMapSpeedgraphLocation` can only be called from a component below the MapSpeedgraphLocationProvider in the tree."
    );
  }
  return locationState;
}
