import {Dispatch, SetStateAction} from "react";
import {TabData} from "./TabData";

// Credit: https://blog.replit.com/leaky-uis
// This is a utility type, a dynamically sized tuple
// that requires at least 2 elements be present. This
// guarantees flatness, i.e. no awkward [[[[A]]]] case
export type Children<T> = [T, T, ...T[]];

export type LaymanDirection = "column" | "row";
export type LaymanPath = Array<number>;

export interface LaymanWindow {
    viewPercent?: number;
    tabs: TabData[];
    selectedIndex?: number;
}

export interface LaymanNode {
    direction: LaymanDirection;
    viewPercent?: number;
    children: Children<LaymanLayout>;
}

export type LaymanLayout = LaymanWindow | LaymanNode | undefined;

// Define the common attributes for all actions
export interface BaseLaymanLayoutAction {
    type: string;
    path: LaymanPath;
}

// Define the specific attributes required for each action type
export interface AddTabAction extends BaseLaymanLayoutAction {
    type: "addTab";
    tab: TabData;
}

export interface RemoveTabAction extends BaseLaymanLayoutAction {
    type: "removeTab";
    tab: TabData;
}

export interface SelectTabAction extends BaseLaymanLayoutAction {
    type: "selectTab";
    tab: TabData;
}

export interface MoveTabAction extends BaseLaymanLayoutAction {
    type: "moveTab";
    tab: TabData;
    newPath: LaymanPath;
    placement: "top" | "bottom" | "left" | "right" | "center";
}

export interface MoveSeparatorAction extends BaseLaymanLayoutAction {
    type: "moveSeparator";
    index: number;
    newSplitPercentage: number;
}

export interface AddWindowAction extends BaseLaymanLayoutAction {
    type: "addWindow";
    window: LaymanWindow;
    placement: "top" | "bottom" | "left" | "right";
}

export interface RemoveWindowAction extends BaseLaymanLayoutAction {
    type: "removeWindow";
}

export interface MoveWindowAction extends BaseLaymanLayoutAction {
    type: "moveWindow";
    window: LaymanWindow;
    newPath: LaymanPath;
    placement: "top" | "bottom" | "left" | "right" | "center";
}

// Currently support two hueristics
export type LaymanHeuristic = "topleft" | "topright";

export interface AddTabActionWithHeuristic {
    type: "addTabWithHeuristic";
    heuristic: LaymanHeuristic;
    tab: TabData;
}

export type AutoArrangeAction = {
    type: "autoArrange";
};

// Union type of all possible actions
export type LaymanLayoutAction =
    | AddTabAction
    | RemoveTabAction
    | SelectTabAction
    | MoveTabAction
    | MoveSeparatorAction
    | AddWindowAction
    | RemoveWindowAction
    | MoveWindowAction
    | AddTabActionWithHeuristic
    | AutoArrangeAction;

export interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface DragTab {
    tab: TabData;
    path?: LaymanPath;
}

interface DragWindow {
    tabs: TabData[];
    path: LaymanPath;
    selectedIndex: number;
}

export type DragData = DragTab | DragWindow;

// Types for component props
export interface SeparatorProps {
    nodePosition: Position;
    position: Position;
    index: number;
    direction: LaymanDirection;
    path: LaymanPath;
    separators?: SeparatorProps[];
}
export interface ToolBarProps {
    path: LaymanPath;
    position: Position;
    tabs: TabData[];
    selectedIndex: number;
}
export interface WindowProps {
    position: Position;
    path: LaymanPath;
    tab: TabData;
    isSelected: boolean;
}

export type PaneRenderer = (arg0: TabData) => JSX.Element;
export type TabRenderer = (arg0: TabData) => string | JSX.Element;

export type ToolbarButtonType =
    | "splitLeft"
    | "splitRight"
    | "splitTop"
    | "splitBottom"
    | "maximize"
    | "minimize"
    | "float"
    | "unfloat"
    | "close"
    | "misc";

export interface LaymanContextType {
    globalContainerSize: Position;
    setGlobalContainerSize: Dispatch<SetStateAction<Position>>;
    layout: LaymanLayout;
    layoutDispatch: React.Dispatch<LaymanLayoutAction>;
    setDropHighlightPosition: React.Dispatch<Position>;
    globalDragging: boolean;
    setGlobalDragging: React.Dispatch<boolean>;
    draggedWindowTabs: TabData[];
    setDraggedWindowTabs: React.Dispatch<TabData[]>;
    windowDragStartPosition: {x: number; y: number};
    setWindowDragStartPosition: React.Dispatch<{x: number; y: number}>;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    mutable: boolean;
    toolbarButtons?: Array<ToolbarButtonType>;
    renderNull: JSX.Element;
    // Path of the currently maximized window, or null if none. Ephemeral state.
    maximizedPath: LaymanPath | null;
    setMaximizedPath: React.Dispatch<React.SetStateAction<LaymanPath | null>>;
    // Windows that have been floated out of the layout. Ephemeral state.
    floatingWindows: FloatingWindowData[];
    setFloatingWindows: React.Dispatch<React.SetStateAction<FloatingWindowData[]>>;
    // Maximum split-nesting depth. depth = path.length (a single root window is
    // depth 0; each split adds 1). Splits that would exceed this are blocked.
    // Defaults to Infinity (no limit).
    maxDepth: number;
    // Whether the window tab row (toolbar) is shown. When false, windows are
    // chromeless and controls move into a compact ellipsis popover.
    showTabs: boolean;
}

// A window that has been "floated" out of the layout tree and is rendered as a
// free-floating, draggable/resizable overlay.
export interface FloatingWindowData {
    id: string;
    tabs: TabData[];
    selectedIndex: number;
    position: Position;
    zIndex: number;
}

export {TabData};

// Serialization Types

export type LaymanSerializedTab = {
    name: string;
    options: Record<string, unknown>;
};

export type LaymanSerializedWindow = {
    kind: "window";
    tabs: LaymanSerializedTab[];
    selectedIndex: number;
    viewPercent?: number;
};

export type LaymanSerializedNode = {
    kind: "node";
    direction: "row" | "column";
    viewPercent?: number;
    children: LaymanSerializedLayout[];
};

export type LaymanSerializedLayout = LaymanSerializedWindow | LaymanSerializedNode | null;
