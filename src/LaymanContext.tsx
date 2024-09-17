import {createContext, useReducer, useState} from "react";
import {
    LaymanContextType,
    LaymanLayout,
    PaneRenderer,
    TabRenderer,
    LaymanLayoutAction,
    Children,
    LaymanWindow,
    LaymanDirection,
} from "./types";
import _ from "lodash";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import React from "react";

// Define default values for the context
const defaultContextValue: LaymanContextType = {
    laymanRef: undefined,
    setLaymanRef: () => {},
    layout: {tabs: []},
    layoutDispatch: () => {},
    renderPane: () => <></>,
    renderTab: () => <></>,
};

type LaymanProviderProps = {
    initialLayout: LaymanLayout;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    children: React.ReactNode;
};

export const LaymanContext =
    createContext<LaymanContextType>(defaultContextValue);

const LayoutReducer = (
    layout: LaymanLayout,
    action: LaymanLayoutAction
): LaymanLayout => {
    switch (action.type) {
        case "addTab": {
            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = _.get(layout, lodashPath);
            if (!window || !("tabs" in window)) return layout;

            return _.set(_.cloneDeep(layout), lodashPath, {
                ...window,
                tabs: [...window.tabs, action.tab],
            });
        }

        case "removeTab": {
            const lodashPath = "children." + action.path.join(".children.");

            const window: LaymanLayout = _.get(layout, lodashPath);
            if (!window || !("tabs" in window)) return layout;

            // Filter out the tab to be removed
            window.tabs = window.tabs.filter((tab) => tab.id !== action.tab.id);

            // If no more tabs exist, remove the window itself
            if (window.tabs.length === 0) {
                return LayoutReducer(layout, {
                    type: "removeWindow",
                    path: action.path,
                });
            }

            // Return updated layout with the tab removed
            return _.set(_.cloneDeep(layout), lodashPath, window);
        }

        case "selectTab": {
            const lodashPath = "children." + action.path.join(".children.");

            const window: LaymanLayout = _.get(layout, lodashPath);

            // Ensure it's a window with tabs
            if (!window || !("tabs" in window)) return layout;

            // Update selectedIndex in the window
            window.selectedIndex = window.tabs.findIndex(
                (tab) => tab.id === action.tab.id
            );

            // Return the updated layout
            return _.set(_.cloneDeep(layout), lodashPath, window);
        }

        case "addWindow": {
            const parentPath = _.dropRight(action.path);
            const parentLodashPath =
                "children." + parentPath.join(".children.");
            const parent: LaymanLayout = _.get(layout, parentLodashPath);
            if (!parent || !("children" in parent)) return layout;

            // Helper to return the updated layout
            const updateLayout = (newChildren: Array<LaymanLayout>) => {
                return _.set(_.cloneDeep(layout), parentLodashPath, {
                    ...parent,
                    children: newChildren as Children<LaymanLayout>,
                });
            };

            // Helper to get the current window
            const getCurrentWindow = () => {
                const lodashPath = "children." + action.path.join(".children.");
                const currWindow: LaymanLayout = _.get(layout, lodashPath);
                return currWindow && "tabs" in currWindow ? currWindow : null;
            };

            // Common logic for adding in a column or row direction
            const addAlongDirection = (index: number) => {
                return updateLayout([
                    ...parent.children.slice(0, index),
                    action.window,
                    ...parent.children.slice(index),
                ]);
            };

            // Common logic for splitting along the opposite direction
            const splitAndAdd = (
                currWindow: LaymanWindow | null,
                direction: LaymanDirection,
                placement: "top" | "bottom" | "left" | "right"
            ) => {
                if (!currWindow) return layout;
                const newChildren: Children<LaymanLayout> =
                    placement === "top" || placement === "left"
                        ? [action.window, currWindow]
                        : [currWindow, action.window];
                return updateLayout(
                    parent.children.map((child, index) =>
                        index === _.last(action.path)
                            ? {direction, children: newChildren}
                            : child
                    )
                );
            };

            const isColumnPlacement =
                action.placement === "top" || action.placement === "bottom";
            const index =
                action.placement === "bottom" || action.placement === "right"
                    ? _.last(action.path)! + 1
                    : _.last(action.path)!;

            if (
                (isColumnPlacement && parent.direction === "column") ||
                (!isColumnPlacement && parent.direction === "row")
            ) {
                console.log("Add along the", parent.direction);
                return addAlongDirection(index);
            } else {
                console.log("Add against the", parent.direction);
                return splitAndAdd(
                    getCurrentWindow(),
                    isColumnPlacement ? "column" : "row",
                    action.placement
                );
            }
        }

        case "removeWindow": {
            const parentPath = _.dropRight(action.path);
            const parentLodashPath =
                "children." + parentPath.join(".children.");
            const parent: LaymanLayout = _.get(layout, parentLodashPath);

            if (!parent || !("children" in parent)) return layout;

            // Remove the child layout since it has no tabs
            const newChildren = parent.children.filter(
                (_value, index) => index !== _.last(action.path)
            );

            if (newChildren.length == 1) {
                return _.set(
                    _.cloneDeep(layout),
                    parentLodashPath,
                    newChildren[0]
                );
            }

            return _.set(_.cloneDeep(layout), parentLodashPath, {
                ...parent,
                children: newChildren as Children<LaymanLayout>,
            });
        }

        // case "moveSeparator": {
        //     if (!("newSplitPercentage" in action)) return layout;

        //     const layoutBranch: LaymanLayout = _.get(
        //         layout,
        //         action.path.join(".children."),
        //         null
        //     );

        //     if (!layoutBranch || !("children" in layoutBranch)) return layout;

        //     // Set the new split percentage for the current layout node
        //     layoutBranch.viewPercent = action.newSplitPercentage;

        //     return _.set(
        //         _.cloneDeep(layout),
        //         action.path.join(".children."),
        //         layoutBranch
        //     );
        // }

        default: {
            throw new Error("Unknown action: " + action);
        }
    }
};

export const LaymanProvider = ({
    initialLayout,
    renderPane,
    renderTab,
    children,
}: LaymanProviderProps) => {
    const [layout, layoutDispatch] = useReducer(LayoutReducer, initialLayout);
    const [laymanRef, setLaymanRef] = useState<React.RefObject<HTMLElement>>();

    return (
        <LaymanContext.Provider
            value={{
                laymanRef,
                setLaymanRef,
                layout,
                layoutDispatch,
                renderPane,
                renderTab,
            }}
        >
            <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </LaymanContext.Provider>
    );
};
