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

// Address of a window that has been floated out of the layout tree (see
// `FloatingWindowData`). Identified by a stable id rather than a tree
// position, since floating windows aren't part of the split tree.
export interface FloatingWindowAddress {
    floatingId: string;
}

// A `WindowAddress` identifies "the window a toolbar/tab/drag operates on":
// either a position in the split tree (`LaymanPath`, e.g. `[0, 1]`) or a
// floating window (`{floatingId}`). This lets floating windows be addressed,
// rendered, and dragged-and-dropped identically to regular tree windows.
export type WindowAddress = LaymanPath | FloatingWindowAddress;

// Define the common attributes for all actions
export interface BaseLaymanLayoutAction {
    type: string;
    path: WindowAddress;
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
    newPath: WindowAddress;
    placement: "top" | "bottom" | "left" | "right" | "center";
}

export interface MoveSeparatorAction {
    type: "moveSeparator";
    path: LaymanPath;
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
    newPath: WindowAddress;
    placement: "top" | "bottom" | "left" | "right" | "center";
    // Initial pixel rect for the new floating window. Required only when
    // `newPath` addresses a floating window that doesn't exist yet (i.e.
    // this is a "float this window" move rather than a merge into an
    // already-floating window).
    position?: Position;
}

// Currently supports two heuristics
export type LaymanHeuristic = "topleft" | "topright";

export interface AddTabActionWithHeuristic {
    type: "addTabWithHeuristic";
    heuristic: LaymanHeuristic;
    tab: TabData;
}

export type AutoArrangeAction = {
    type: "autoArrange";
};

// Reposition/resize a floating window (e.g. dragging an edge/corner resize
// handle, or relocating it after a docking drag that didn't land on a drop
// target).
export interface SetFloatingWindowPositionAction {
    type: "setFloatingWindowPosition";
    floatingId: string;
    position: Position;
}

// Raise a floating window's z-index above its siblings (click-to-focus).
export interface BringFloatingWindowToFrontAction {
    type: "bringFloatingWindowToFront";
    floatingId: string;
}

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
    | AutoArrangeAction
    | SetFloatingWindowPositionAction
    | BringFloatingWindowToFrontAction;

export interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface DragTab {
    tab: TabData;
    path?: WindowAddress;
}

export interface DragWindow {
    tabs: TabData[];
    path: WindowAddress;
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
    path: WindowAddress;
    position: Position;
    tabs: TabData[];
    selectedIndex: number;
    // z-index override, used only for floating windows.
    zIndex?: number;
}
export interface WindowProps {
    position: Position;
    path: WindowAddress;
    tab: TabData;
    isSelected: boolean;
    // z-index override, used only for floating windows.
    zIndex?: number;
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
    // Address of the currently maximized window, or null if none. Ephemeral state.
    maximizedPath: WindowAddress | null;
    setMaximizedPath: React.Dispatch<React.SetStateAction<WindowAddress | null>>;
    // Windows that have been floated out of the layout. Lives in the same
    // reducer-managed state as `layout`; mutate it via `layoutDispatch`.
    floatingWindows: FloatingWindowData[];
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

// The full reducer-managed state: the split tree plus any floating windows.
export interface LaymanState {
    layout: LaymanLayout;
    floatingWindows: FloatingWindowData[];
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

export type LaymanSerializedFloatingWindow = {
    id: string;
    tabs: LaymanSerializedTab[];
    selectedIndex: number;
    position: Position;
    zIndex: number;
};

export type LaymanSerializedState = {
    layout: LaymanSerializedLayout;
    floatingWindows: LaymanSerializedFloatingWindow[];
};
