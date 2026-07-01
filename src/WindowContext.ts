import {createContext, useContext} from "react";
import {TabData} from "./TabData";
import {WindowProps} from "./types";

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

export const useWindowContext = () => useContext(WindowContext);
