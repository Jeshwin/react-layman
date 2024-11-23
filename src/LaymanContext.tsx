import {createContext, useReducer, useState} from "react";
import {LaymanContextType, LaymanLayout, PaneRenderer, TabRenderer, Position} from "./types";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import React from "react";
import {DropHighlight} from "./DropHighlight";
import {TabData} from "./TabData";
import {LaymanReducer} from "./LaymanReducer";

// Define default values for the context
const defaultContextValue: LaymanContextType = {
    globalContainerSize: {top: 0, left: 0, width: 0, height: 0},
    setGlobalContainerSize: () => {},
    layout: {tabs: []},
    layoutDispatch: () => {},
    setDropHighlightPosition: () => {},
    globalDragging: false,
    setGlobalDragging: () => {},
    draggedWindowTabs: [],
    setDraggedWindowTabs: () => {},
    windowDragStartPosition: {x: 0, y: 0},
    setWindowDragStartPosition: () => {},
    renderPane: () => <></>,
    renderTab: () => <></>,
};

type LaymanProviderProps = {
    initialLayout: LaymanLayout;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    children: React.ReactNode;
};

export const LaymanContext = createContext<LaymanContextType>(defaultContextValue);

export const LaymanProvider = ({initialLayout, renderPane, renderTab, children}: LaymanProviderProps) => {
    const [layout, layoutDispatch] = useReducer(LaymanReducer, initialLayout);
    // Size of Layman container
    const [globalContainerSize, setGlobalContainerSize] = useState<Position>({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });
    const [dropHighlightPosition, setDropHighlightPosition] = useState<Position>({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });
    const [draggedWindowTabs, setDraggedWindowTabs] = useState<TabData[]>([]);
    const [windowDragStartPosition, setWindowDragStartPosition] = useState({
        x: 0,
        y: 0,
    });
    const [globalDragging, setGlobalDragging] = useState<boolean>(false);

    return (
        <LaymanContext.Provider
            value={{
                globalContainerSize,
                setGlobalContainerSize,
                layout,
                layoutDispatch,
                setDropHighlightPosition,
                globalDragging,
                setGlobalDragging,
                draggedWindowTabs,
                setDraggedWindowTabs,
                windowDragStartPosition,
                setWindowDragStartPosition,
                renderPane,
                renderTab,
            }}
        >
            <DndProvider backend={HTML5Backend}>
                <DropHighlight position={dropHighlightPosition} isDragging={globalDragging} />
                <div id="drag-window-border"></div>
                {children}
            </DndProvider>
        </LaymanContext.Provider>
    );
};
