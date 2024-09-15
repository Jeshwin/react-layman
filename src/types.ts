import {Dispatch, SetStateAction} from "react";
import {Inset} from "./Inset";
import {TabData} from "./TabData";

// Define a type for the draggable item
export const TabType = "TAB";
export type LaymanTabs = TabData[];

export type LaymanDirection = "column" | "row";

export type LaymanBranch = "first" | "second";
export type LaymanPath = LaymanBranch[];

export type LaymanLayout =
    | LaymanTabs
    | {
          direction: LaymanDirection;
          first: LaymanLayout;
          second: LaymanLayout;
          splitPercentage?: number;
      };

export interface LaymanLayoutAction {
    type: string;
    path: LaymanPath;
    tab?: TabData;
    direction?: LaymanDirection;
    placement?: LaymanBranch;
    newSplitPercentage?: number;
}

export type PaneRenderer = (arg0: TabData) => JSX.Element;
export type TabRenderer = (arg0: TabData) => string | JSX.Element;

// Types for component props
export interface SeparatorProps {
    parentInset: Inset;
    splitPercentage: number;
    direction: LaymanDirection;
    path: LaymanPath;
}
export interface ToolBarProps {
    inset: Inset;
    path: LaymanPath;
    tabs: LaymanTabs;
}
export interface PaneProps {
    inset: Inset;
    tab: TabData;
}

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
