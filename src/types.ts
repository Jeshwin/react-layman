import {Dispatch, SetStateAction} from "react";

export type LaymanKey = string;
export type LaymanKeys = LaymanKey[];

export type LaymanDirection = "column" | "row";

export type LaymanBranch = "first" | "second";
export type LaymanPath = LaymanBranch[];

export type LaymanLayout =
    | LaymanKeys
    | {
          direction: LaymanDirection;
          first: LaymanLayout;
          second: LaymanLayout;
          splitPercentage?: number;
      };

export type PaneRenderer = (arg0: LaymanKey) => JSX.Element;
export type TabRenderer = (arg0: LaymanKey) => string | JSX.Element;

export interface InsetInput {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface LaymanContextType {
    laymanRef: React.RefObject<HTMLElement> | null;
    setLaymanRef: Dispatch<SetStateAction<React.RefObject<HTMLElement> | null>>;
    layout: LaymanLayout;
    setLayout: Dispatch<SetStateAction<LaymanLayout>>;
    addWindow: (
        direction: LaymanDirection,
        placement: LaymanBranch,
        newWindowTabs: LaymanKeys,
        path: LaymanPath
    ) => void;
    globalTabs: LaymanKeys;
    addTab: (path: LaymanPath, tab: LaymanKey) => void;
    removeTab: (
        path: LaymanPath,
        tabs: LaymanKeys,
        index: number,
        currentTabIndex: number,
        setCurrentTabIndex: Dispatch<SetStateAction<number>>
    ) => void;
    createUniqueTabId: (tabId: LaymanKey) => string;
    selectedTabs: LaymanKeys;
    setSelectedTabs: Dispatch<SetStateAction<LaymanKeys>>;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    separatorThickness: number;
    windowToolbarHeight: number;
}
