import {createContext, useContext} from "react";
import {WindowProps} from "./types";
import {TabData} from "./TabData";

// Create WindowContext
export const WindowContext = createContext<WindowProps>({
    position: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    },
    path: [],
    tab: new TabData(""),
    isSelected: false,
});

// Custom hook to use WindowContext easily
export const useWindowContext = () => useContext(WindowContext);
