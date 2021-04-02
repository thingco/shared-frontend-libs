import React from "react";

interface MapEventSelectionContextValues {
  isSingleEventView: boolean;
  selectedEvent: number | null;
  setSelectedEvent: (selectedEvent: number | null) => void;
  selectedSpeedgraphLocation: number;
  setSelectedSpeedgraphLocation: (
    selectedSpeedgraphLocation: number,
  ) => void;
}

export const MapEventSelectionContext = React.createContext<
  MapEventSelectionContextValues
>({
  isSingleEventView: false,
  selectedEvent: null,
  setSelectedEvent: () => void 0,
  selectedSpeedgraphLocation: 0,
  setSelectedSpeedgraphLocation: () => void 0,
});

export interface MapEventSelectionProviderProps {
  children: React.ReactNode,
  isSingleEventView: boolean, 
}

export const MapEventSelectionProvider = (
  { children, isSingleEventView }: MapEventSelectionProviderProps
): JSX.Element => {
  const [selectedEvent, setSelectedEvent] = React.useState<number | null>(isSingleEventView ? 0 : null);
  const [selectedSpeedgraphLocation, setSelectedSpeedgraphLocation] = React
    .useState<number>(0);

  return (
    <MapEventSelectionContext.Provider
      value={{
        isSingleEventView,
        selectedEvent,
        setSelectedEvent,
        selectedSpeedgraphLocation,
        setSelectedSpeedgraphLocation,
      }}
    >
      {children}
    </MapEventSelectionContext.Provider>
  );
};

/**
 *
 */
export function useMapEventSelection(): MapEventSelectionContextValues {
  const selectionState = React.useContext(MapEventSelectionContext);
  if (!MapEventSelectionContext) {
    throw new Error(
      "`useMapEventSelection` can only be called from a component below the MapSelectionProvider in the tree.",
    );
  }
  return selectionState;
}
