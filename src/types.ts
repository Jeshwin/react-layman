import {Dispatch, SetStateAction} from "react";
import {TabData} from "./TabData";

// Credit: https://blog.replit.com/leaky-uis
// This is a utility type, a dynamically sized tuple
// that requires at least 2 elements be present. This
// guarantees flatness, i.e. no awkward [[[[A]]]] case
export type Children<T> = [T, T, ...T[]];

export const TabType = "TAB";

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
interface BaseLaymanLayoutAction {
    type: string;
    path: LaymanPath;
}

// Define the specific attributes required for each action type
interface AddTabAction extends BaseLaymanLayoutAction {
    type: "addTab";
    tab: TabData;
}

interface RemoveTabAction extends BaseLaymanLayoutAction {
    type: "removeTab";
    tab: TabData;
}

interface SelectTabAction extends BaseLaymanLayoutAction {
    type: "selectTab";
    tab: TabData;
}

// interface MoveSeparatorAction extends BaseLaymanLayoutAction {
//     type: "moveSeparator";
//     newSplitPercentage: number;
//     neighbors: [LaymanWindow, LaymanWindow]; // The two affected windows
// }

interface AddWindowAction extends BaseLaymanLayoutAction {
    type: "addWindow";
    window: LaymanWindow;
    placement: "top" | "bottom" | "left" | "right";
}

interface RemoveWindowAction extends BaseLaymanLayoutAction {
    type: "removeWindow";
}

// Union type of all possible actions
export type LaymanLayoutAction =
    | AddTabAction
    | RemoveTabAction
    | SelectTabAction
    // | MoveSeparatorAction
    | AddWindowAction
    | RemoveWindowAction;

export interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

// Types for component props
export interface SeparatorProps {
    parentPosition: Position;
    splitPercentage: number;
    direction: LaymanDirection;
    path: LaymanPath;
}
export interface ToolBarProps {
    position: Position;
    path: LaymanPath;
    tabs: TabData[];
}
export interface PaneProps {
    position: Position;
    tab: TabData;
}

export type PaneRenderer = (arg0: TabData) => JSX.Element;
export type TabRenderer = (arg0: TabData) => string | JSX.Element;

export interface LaymanContextType {
    laymanRef: React.RefObject<HTMLElement> | undefined;
    setLaymanRef: Dispatch<
        SetStateAction<React.RefObject<HTMLElement> | undefined>
    >;
    layout: LaymanLayout;
    layoutDispatch: React.Dispatch<LaymanLayoutAction>;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
}
