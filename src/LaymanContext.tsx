import React, {createContext, useEffect, useReducer, useRef, useState} from "react";
import {
    LaymanContextType,
    LaymanLayout,
    PaneRenderer,
    TabRenderer,
    Position,
    ToolbarButtonType,
    WindowAddress,
} from "./types";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DropHighlight} from "./DropHighlight";
import {TabData} from "./TabData";
import {LaymanReducer} from "./LaymanReducer";
import {loadState, saveState} from "./persistence";

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
    maxDepth: Infinity,
    showTabs: true,
};

type LaymanProviderProps = {
    initialLayout: LaymanLayout;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    renderNull: JSX.Element;
    mutable?: boolean;
    toolbarButtons?: Array<ToolbarButtonType>;
    storageKey?: string;
    // Maximum split-nesting depth (depth = path.length). Default: no limit.
    maxDepth?: number;
    // Show/hide the window tab row. Default: true.
    showTabs?: boolean;
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
    maxDepth = Infinity,
    showTabs = true,
    children,
}: LaymanProviderProps) => {
    const [{layout, floatingWindows}, layoutDispatch] = useReducer(
        LaymanReducer,
        {layout: initialLayout, floatingWindows: []},
        (init) => loadState(storageKey, init)
    );

    const saveTimeoutRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        if (!storageKey) return;
        if (saveTimeoutRef.current !== undefined) {
            window.clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = window.setTimeout(() => {
            saveState(storageKey, {layout, floatingWindows});
            saveTimeoutRef.current = undefined;
        }, 150);
        return () => {
            if (saveTimeoutRef.current !== undefined) {
                window.clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = undefined;
                saveState(storageKey, {layout, floatingWindows});
            }
        };
    }, [layout, floatingWindows, storageKey]);
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
    // Ephemeral UI state: which window is currently maximized.
    const [maximizedPath, setMaximizedPath] = useState<WindowAddress | null>(null);

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
                maxDepth,
                showTabs,
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
