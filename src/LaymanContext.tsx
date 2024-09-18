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
    Position,
} from "./types";
import _ from "lodash";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import React from "react";
import {DropHighlight} from "./DropHighlight";

// Define default values for the context
const defaultContextValue: LaymanContextType = {
    laymanRef: undefined,
    setLaymanRef: () => {},
    layout: {tabs: []},
    layoutDispatch: () => {},
    setDropHighlightPosition: () => {},
    setIsDragging: () => {},
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

            // Create a new array of tabs without the removed tab
            const updatedTabs = window.tabs.filter(
                (tab) => tab.id !== action.tab.id
            );

            // Adjust selectedIndex only if the removed tab is to the left of the selected one
            let updatedSelectedIndex = window.selectedIndex;
            const removedTabIndex = _.indexOf(window.tabs, action.tab);

            if (
                window.selectedIndex &&
                removedTabIndex <= window.selectedIndex
            ) {
                updatedSelectedIndex = Math.max(0, window.selectedIndex - 1);
            }

            // If no more tabs exist, remove the window itself
            if (updatedTabs.length === 0) {
                return LayoutReducer(layout, {
                    type: "removeWindow",
                    path: action.path,
                });
            }

            // Return updated layout with immutability, ensuring no direct mutations
            const updatedWindow = {
                ...window,
                tabs: updatedTabs,
                selectedIndex: updatedSelectedIndex,
            };

            return _.set(_.cloneDeep(layout), lodashPath, updatedWindow);
        }

        case "selectTab": {
            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = _.get(layout, lodashPath);
            if (!window || !("tabs" in window)) return layout;

            // Update selectedIndex in the window
            window.selectedIndex = window.tabs.findIndex(
                (tab) => tab.id === action.tab.id
            );

            // Return the updated layout
            return _.set(_.cloneDeep(layout), lodashPath, window);
        }

        case "moveTab": {
            console.log(
                `Dropped ${action.tab.id} onto ${action.newPath.join(".")}.${
                    action.placement
                }`
            );
            console.dir(action);

            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = _.get(layout, lodashPath);
            if (!window || !("tabs" in window)) return layout;

            const removeTabLayout = LayoutReducer(layout, {
                type: "removeTab",
                path: action.path,
                tab: action.tab,
            });

            if (action.placement === "center") {
                return LayoutReducer(removeTabLayout, {
                    type: "addTab",
                    path: action.newPath,
                    tab: action.tab,
                });
            } else {
                return LayoutReducer(removeTabLayout, {
                    type: "addWindow",
                    path: action.newPath,
                    window: {
                        tabs: [action.tab],
                        selectedIndex: 0,
                    },
                    placement: action.placement,
                });
            }
        }

        case "addWindow": {
            // Handle the root-level case
            if (action.path.length === 1) {
                if (!("children" in layout)) return layout;
                const isColumnPlacement =
                    action.placement === "top" || action.placement === "bottom";
                const currRootWindow = layout.children[action.path[0]];

                if (
                    (isColumnPlacement && layout.direction === "column") ||
                    (!isColumnPlacement && layout.direction === "row")
                ) {
                    // Add the window along the existing root direction
                    const index =
                        action.placement === "bottom" ||
                        action.placement === "right"
                            ? action.path[0] + 1 // Add after the current window
                            : action.path[0]; // Add before the current window
                    const newRootChildren = [
                        ...layout.children.slice(0, index),
                        action.window,
                        ...layout.children.slice(index),
                    ];

                    return {
                        ...layout,
                        children: newRootChildren as Children<LaymanLayout>,
                    };
                } else {
                    // Split the root window into a new layout with the opposite direction
                    return {
                        ...layout,
                        children: layout.children.map((child, index) => {
                            if (index != action.path[0]) return child;
                            return {
                                direction: isColumnPlacement ? "column" : "row",
                                children:
                                    action.placement === "top" ||
                                    action.placement === "left"
                                        ? [action.window, currRootWindow]
                                        : [currRootWindow, action.window],
                            };
                        }) as Children<LaymanLayout>,
                    };
                }
            }

            // Handle the non-root case
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
            // Handle the root-level case
            if (action.path.length === 1) {
                if (!("children" in layout)) return layout;

                return {
                    ...layout,
                    children: layout.children.filter(
                        (_value, index) => index !== _.last(action.path)
                    ) as Children<LaymanLayout>,
                };
            }

            // Handle the non-root case
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
    const [dropHighlightPosition, setDropHighlightPosition] =
        useState<Position>({
            top: 0,
            left: 0,
            width: 0,
            height: 0,
        });
    const [isDragging, setIsDragging] = useState<boolean>(false);

    return (
        <LaymanContext.Provider
            value={{
                laymanRef,
                setLaymanRef,
                layout,
                layoutDispatch,
                setDropHighlightPosition,
                setIsDragging,
                renderPane,
                renderTab,
            }}
        >
            <DndProvider backend={HTML5Backend}>
                <DropHighlight
                    position={dropHighlightPosition}
                    isDragging={isDragging}
                />
                {children}
            </DndProvider>
        </LaymanContext.Provider>
    );
};
