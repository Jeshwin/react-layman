import {Dispatch, SetStateAction} from "react";
import {TabData} from "./TabData";

// Credit: https://blog.replit.com/leaky-uis
// This is a utility type, a dynamically sized tuple
// that requires at least 2 elements be present. This
// guarantees flatness, i.e. no awkward [[[[A]]]] case
type Children<T> = [T, T, ...T[]];

export const TabType = "TAB";

export type LaymanDirection = "column" | "row";
export type LaymanPath = number[];

export interface LaymanWindow {
    viewPercent?: number;
    tabs: TabData[];
    selectedIndex: number;
}

export type LaymanLayout =
    | LaymanWindow
    | {
          direction: LaymanDirection;
          viewPercent?: number;
          children: Children<LaymanLayout>;
      };

export interface LaymanLayoutAction {
    type: string;
    path: LaymanPath;
    // tab?: TabData;
    // direction?: LaymanDirection;
    // placement?: LaymanBranch;
    // newSplitPercentage?: number;
    [key: string]: unknown;
}

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
