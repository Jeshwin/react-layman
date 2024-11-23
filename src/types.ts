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

export type LaymanLayout = LaymanWindow | LaymanNode;

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

// Union type of all possible actions
export type LaymanLayoutAction =
    | AddTabAction
    | RemoveTabAction
    | SelectTabAction
    | MoveTabAction
    | MoveSeparatorAction
    | AddWindowAction
    | RemoveWindowAction
    | MoveWindowAction;

export interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

export const TabType = "TAB";
export const WindowType = "WINDOW";

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
}
