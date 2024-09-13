import {Dispatch, SetStateAction} from "react";
import {Inset} from "./Inset";
import {TabData} from "./TabData";

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
    laymanRef: React.RefObject<HTMLElement> | null;
    setLaymanRef: Dispatch<SetStateAction<React.RefObject<HTMLElement> | null>>;
    layout: LaymanLayout;
    setLayout: Dispatch<SetStateAction<LaymanLayout>>;
    addWindow: (
        direction: LaymanDirection,
        placement: LaymanBranch,
        newWindowTabs: LaymanTabs,
        path: LaymanPath
    ) => void;
    globalTabs: LaymanTabs;
    setGlobalTabs: Dispatch<SetStateAction<LaymanTabs>>;
    addTab: (path: LaymanPath, tab: TabData) => void;
    removeTab: (
        path: LaymanPath,
        tabs: LaymanTabs,
        index: number,
        currentTabIndex: number,
        setCurrentTabIndex: Dispatch<SetStateAction<number>>
    ) => void;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    separatorThickness: number;
    windowToolbarHeight: number;
}
