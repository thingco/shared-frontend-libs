import React, { createContext } from "react";

const ExampleContext = createContext({});

export const Example = ({ children }: { children: React.ReactNode }) => (
	<ExampleContext.Provider value={{}}>{children}</ExampleContext.Provider>
);
