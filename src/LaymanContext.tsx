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
    LaymanPath,
} from "./types";
import _ from "lodash";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import React from "react";
import {DropHighlight} from "./DropHighlight";
import {TabData} from "./TabData";

// Define default values for the context
const defaultContextValue: LaymanContextType = {
    laymanRef: undefined,
    setLaymanRef: () => {},
    layout: {tabs: []},
    layoutDispatch: () => {},
    setDropHighlightPosition: () => {},
    setIsDragging: () => {},
    draggedWindowTabs: [],
    setDraggedWindowTabs: () => {},
    windowDragStartPosition: {x: 0, y: 0},
    setWindowDragStartPosition: () => {},
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
            // Edge case: layout is a single window
            if ("tabs" in layout) {
                return {
                    ...layout,
                    tabs: [...layout.tabs, action.tab],
                };
            }

            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = _.get(layout, lodashPath);
            if (!window || !("tabs" in window)) return layout;

            return _.set(_.cloneDeep(layout), lodashPath, {
                ...window,
                tabs: [...window.tabs, action.tab],
            });
        }

        case "removeTab": {
            // Edge case: layout is a single window
            if ("tabs" in layout) {
                return {
                    ...layout,
                    tabs: layout.tabs.filter((tab) => tab.id !== action.tab.id),
                };
            }

            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = _.get(layout, lodashPath);
            if (!window || !("tabs" in window)) return layout;

            // Create a new array of tabs without the removed tab
            const updatedTabs = window.tabs.filter(
                (tab) => tab.id !== action.tab.id
            );

            // Adjust selectedIndex only if the removed tab is
            // to the left of the selected one
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

            return _.set(_.cloneDeep(layout), lodashPath, {
                ...window,
                tabs: updatedTabs,
                selectedIndex: updatedSelectedIndex,
            });
        }

        case "selectTab": {
            // Edge case: layout is a single window
            if ("tabs" in layout) {
                return {
                    ...layout,
                    selectedIndex: layout.tabs.findIndex(
                        (tab) => tab.id === action.tab.id
                    ),
                };
            }

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
                    // Split the root window into a new layout
                    // with the opposite direction
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
                return addAlongDirection(index);
            } else {
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
                if ("children" in newChildren[0]) {
                    // Handle grandparent being root
                    if (parentPath.length == 1) {
                        if (!("children" in layout)) return layout;
                        if (layout.direction == newChildren[0].direction) {
                            const parentIndex = _.findIndex(
                                layout.children,
                                (win) => win === parent
                            );

                            return {
                                ...layout,
                                children: [
                                    ...layout.children.slice(0, parentIndex),
                                    ...newChildren[0].children,
                                    ...layout.children.slice(parentIndex + 1),
                                ] as Children<LaymanLayout>,
                            };
                        }
                    }
                    // Check if "grandparent" is same direction as new parent
                    const grandparentPath = _.dropRight(parentPath);
                    const grandparentLodashPath =
                        "children." + grandparentPath.join(".children.");

                    console.log(parentLodashPath);
                    console.log(grandparentLodashPath);
                    const grandparent: LaymanLayout = _.get(
                        layout,
                        grandparentLodashPath
                    );

                    if (!grandparent || !("children" in grandparent))
                        return layout;

                    console.log(grandparent.direction);
                    console.log(newChildren[0].direction);

                    if (grandparent.direction === newChildren[0].direction) {
                        // Find index of parent in grandparent.windows
                        const parentIndex = _.findIndex(
                            grandparent.children,
                            (win) => win === parent
                        );

                        // Set the updated grandparent back into the layout
                        return _.set(
                            _.cloneDeep(layout),
                            grandparentLodashPath,
                            {
                                ...grandparent,
                                children: [
                                    ...grandparent.children.slice(
                                        0,
                                        parentIndex
                                    ), // windows before the parent
                                    ...newChildren[0].children, // windows from parent
                                    ...grandparent.children.slice(
                                        parentIndex + 1
                                    ), // windows after the parent
                                ],
                            }
                        );
                    }
                }

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

        case "moveWindow": {
            console.log(action.path.join("."));
            console.log(action.newPath.join("."));

            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = _.get(layout, lodashPath);
            if (!window || !("tabs" in window)) return layout;

            const removeWindowLayout = LayoutReducer(layout, {
                type: "removeWindow",
                path: action.path,
            });

            const adjustPath = (
                layout: LaymanLayout,
                originalPath: LaymanPath,
                newPath: LaymanPath
            ) => {
                let adjustedPath = _.clone(newPath);

                // Step 1: Check if the originalPath's parent has turned from a split into a window
                const parentPath = _.dropRight(originalPath);
                const parentLodashPath =
                    "children." + parentPath.join(".children.");
                const parent = _.get(layout, parentLodashPath);

                if (parent && "tabs" in parent) {
                    // Case where the parent is now a single window, so we remove the last entry of newPath
                    if (_.isEqual(_.dropRight(newPath), parentPath)) {
                        // If newPath shares the same parent as the moved window
                        adjustedPath = _.dropRight(newPath);
                        return adjustedPath;
                    }
                }

                // Step 2: Check if the originalPath and newPath share the same parent, and adjust the shared path
                const commonLength = _.takeWhile(
                    originalPath,
                    (val, idx) => val === newPath[idx]
                ).length;
                if (commonLength == originalPath.length - 1) {
                    // Both paths share the same parent
                    const parentIndex = originalPath[commonLength]; // Last shared index

                    // If the original path is further into the parent split, decrement the path index of the newPath
                    if (newPath[commonLength] > parentIndex) {
                        adjustedPath[commonLength] = newPath[commonLength] - 1;
                    }
                }

                console.log(originalPath.join("."));
                console.log(adjustedPath.join("."));

                return adjustedPath;
            };

            // Edge case: removing window causes newPath to change
            const newPath = adjustPath(
                removeWindowLayout,
                action.path,
                action.newPath
            );
            if (action.placement === "center") {
                // Add all tabs
                let updatedLayout = _.cloneDeep(removeWindowLayout);

                action.window.tabs.forEach((tab) => {
                    updatedLayout = LayoutReducer(updatedLayout, {
                        type: "addTab",
                        path: newPath,
                        tab: tab,
                    });
                });

                return updatedLayout;
            } else {
                return LayoutReducer(removeWindowLayout, {
                    type: "addWindow",
                    path: newPath,
                    window: action.window,
                    placement: action.placement,
                });
            }
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
    const [draggedWindowTabs, setDraggedWindowTabs] = useState<TabData[]>([]);
    const [windowDragStartPosition, setWindowDragStartPosition] = useState({
        x: 0,
        y: 0,
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
                draggedWindowTabs,
                setDraggedWindowTabs,
                windowDragStartPosition,
                setWindowDragStartPosition,
                renderPane,
                renderTab,
            }}
        >
            <DndProvider backend={HTML5Backend}>
                <DropHighlight
                    position={dropHighlightPosition}
                    isDragging={isDragging}
                />
                <div id="drag-window-border"></div>
                {children}
            </DndProvider>
        </LaymanContext.Provider>
    );
};
