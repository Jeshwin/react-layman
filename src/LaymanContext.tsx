import {createContext, useEffect, useReducer, useRef, useState} from "react";
import {
    LaymanContextType,
    LaymanLayout,
    LaymanPath,
    PaneRenderer,
    TabRenderer,
    Position,
    ToolbarButtonType,
    FloatingWindowData,
} from "./types";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import React from "react";
import {DropHighlight} from "./DropHighlight";
import {TabData} from "./TabData";
import {LaymanReducer} from "./LaymanReducer";
import {loadLayout, saveLayout} from "./persistence";

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
    mutable: false,
    toolbarButtons: [],
    renderNull: <></>,
    maximizedPath: null,
    setMaximizedPath: () => {},
    floatingWindows: [],
    setFloatingWindows: () => {},
};

type LaymanProviderProps = {
    initialLayout: LaymanLayout;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    renderNull: JSX.Element;
    mutable?: boolean;
    toolbarButtons?: Array<ToolbarButtonType>;
    storageKey?: string;
    children: React.ReactNode;
};

export const LaymanContext = createContext<LaymanContextType>(defaultContextValue);

export const LaymanProvider = ({
    initialLayout,
    renderPane,
    renderTab,
    renderNull,
    mutable = false,
    toolbarButtons = [],
    storageKey,
    children,
}: LaymanProviderProps) => {
    const [layout, layoutDispatch] = useReducer(
        LaymanReducer,
        initialLayout,
        (init) => loadLayout(storageKey, init),
    );

    const saveTimeoutRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        if (!storageKey) return;
        if (saveTimeoutRef.current !== undefined) {
            window.clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = window.setTimeout(() => {
            saveLayout(storageKey, layout);
            saveTimeoutRef.current = undefined;
        }, 150);
        return () => {
            if (saveTimeoutRef.current !== undefined) {
                window.clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = undefined;
                saveLayout(storageKey, layout);
            }
        };
    }, [layout, storageKey]);
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
    // Ephemeral window controls: which window is maximized, and floated windows.
    const [maximizedPath, setMaximizedPath] = useState<LaymanPath | null>(null);
    const [floatingWindows, setFloatingWindows] = useState<FloatingWindowData[]>([]);

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
                mutable,
                toolbarButtons,
                renderNull,
                maximizedPath,
                setMaximizedPath,
                floatingWindows,
                setFloatingWindows,
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
