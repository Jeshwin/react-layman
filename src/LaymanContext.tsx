import {createContext, useReducer, useState} from "react";
import {
    LaymanContextType,
    LaymanLayout,
    PaneRenderer,
    TabRenderer,
    LaymanLayoutAction,
    Children,
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

export const LaymanContext = createContext<LaymanContextType>(defaultContextValue);

const LayoutReducer = (layout: LaymanLayout, action: LaymanLayoutAction): LaymanLayout => {
    /**
     * Helper function to get nested layout object at a path
     */
    const getLayoutAtPath = (layout: LaymanLayout, path: LaymanPath) => {
        if (path.length === 0) return layout;
        const lodashPath = "children." + path.join(".children.");
        return _.get(layout, lodashPath);
    };

    switch (action.type) {
        case "addTab": {
            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = getLayoutAtPath(layout, action.path);
            if (!window || !("tabs" in window)) return layout;

            const updatedLayout = {
                ...window,
                tabs: [...window.tabs, action.tab],
            };

            if (action.path.length == 0) {
                return updatedLayout;
            } else {
                return _.set(_.cloneDeep(layout), lodashPath, updatedLayout);
            }
        }

        case "removeTab": {
            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = getLayoutAtPath(layout, action.path);
            if (!window || !("tabs" in window)) return layout;

            // Create a new array of tabs without the removed tab
            const updatedTabs = window.tabs.filter((tab) => tab.id !== action.tab.id);

            // Adjust selectedIndex only if the removed tab is
            // to the left of the selected one
            let updatedSelectedIndex = window.selectedIndex;
            const removedTabIndex = _.indexOf(window.tabs, action.tab);

            if (window.selectedIndex && removedTabIndex <= window.selectedIndex) {
                updatedSelectedIndex = Math.max(0, window.selectedIndex - 1);
            }

            // If no more tabs exist, remove the window itself
            if (updatedTabs.length === 0) {
                return LayoutReducer(layout, {
                    type: "removeWindow",
                    path: action.path,
                });
            }

            const updatedLayout = {
                ...window,
                tabs: updatedTabs,
                selectedIndex: updatedSelectedIndex,
            };

            if (action.path.length == 0) {
                return updatedLayout;
            } else {
                return _.set(_.cloneDeep(layout), lodashPath, updatedLayout);
            }
        }

        case "selectTab": {
            const lodashPath = "children." + action.path.join(".children.");
            const window: LaymanLayout = getLayoutAtPath(layout, action.path);
            if (!window || !("tabs" in window)) return layout;

            // Update selectedIndex in the window
            const updatedLayout = {
                ...window,
                selectedIndex: window.tabs.findIndex((tab) => tab.id === action.tab.id),
            };

            if (action.path.length == 0) {
                return updatedLayout;
            } else {
                return _.set(_.cloneDeep(layout), lodashPath, updatedLayout);
            }
        }

        case "moveTab": {
            const window: LaymanLayout = getLayoutAtPath(layout, action.path);
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
            const parentLodashPath = "children." + _.dropRight(action.path).join(".children.");
            const parent: LaymanLayout = getLayoutAtPath(layout, _.dropRight(action.path));
            console.dir(parent);
            if (!parent) return layout;

            if (!("children" in parent)) {
                // Base layout must be window, adding to this
                const isColumnPlacement = action.placement === "top" || action.placement === "bottom";
                const newChildren: Children<LaymanLayout> =
                    action.placement === "top" || action.placement === "left"
                        ? [action.window, parent]
                        : [parent, action.window];
                return {
                    direction: isColumnPlacement ? "column" : "row",
                    children: newChildren,
                };
            }

            const isColumnPlacement = action.placement === "top" || action.placement === "bottom";
            const index =
                action.placement === "bottom" || action.placement === "right"
                    ? _.last(action.path)! + 1
                    : _.last(action.path)!;

            if (
                (isColumnPlacement && parent.direction === "column") ||
                (!isColumnPlacement && parent.direction === "row")
            ) {
                const updatedLayout = {
                    ...parent,
                    children: [
                        ...parent.children.slice(0, index),
                        action.window,
                        ...parent.children.slice(index),
                    ] as Children<LaymanLayout>,
                };
                if (_.dropRight(action.path).length == 0) {
                    return updatedLayout;
                } else {
                    return _.set(_.cloneDeep(layout), parentLodashPath, updatedLayout);
                }
            } else {
                const window: LaymanLayout = getLayoutAtPath(layout, action.path);
                if (!window || !("tabs" in window)) return layout;
                const newChildren: Children<LaymanLayout> =
                    action.placement === "top" || action.placement === "left"
                        ? [action.window, window]
                        : [window, action.window];
                const updatedLayout = {
                    ...parent,
                    children: parent.children.map((child, index) =>
                        index === _.last(action.path)
                            ? {
                                  direction: isColumnPlacement ? "column" : "row",
                                  children: newChildren,
                              }
                            : child
                    ) as Children<LaymanLayout>,
                };
                if (_.dropRight(action.path).length == 0) {
                    return updatedLayout;
                } else {
                    return _.set(_.cloneDeep(layout), parentLodashPath, updatedLayout);
                }
            }
        }

        case "removeWindow": {
            const parentPath = _.dropRight(action.path);
            const parentLodashPath = "children." + parentPath.join(".children.");
            const parent: LaymanLayout = getLayoutAtPath(layout, parentPath);
            if (!parent || !("children" in parent)) return layout;

            // Remove the child layout since it has no tabs
            const newChildren = parent.children.filter((_value, index) => index !== _.last(action.path));

            if (newChildren.length != 1) {
                const updatedLayout = {
                    ...parent,
                    children: newChildren as Children<LaymanLayout>,
                };
                if (parentPath.length == 0) {
                    return updatedLayout;
                }
                return _.set(_.cloneDeep(layout), parentLodashPath, updatedLayout);
            }
            // Replace parent with only child
            if (!("children" in newChildren[0])) {
                if (parentPath.length == 0) {
                    return newChildren[0];
                }
                return _.set(_.cloneDeep(layout), parentLodashPath, newChildren[0]);
            }

            // Check if "grandparent" is same direction as new parent
            const grandparentPath = _.dropRight(parentPath);
            const grandparentLodashPath = "children." + grandparentPath.join(".children.");
            const grandparent = getLayoutAtPath(layout, grandparentPath);
            if (!grandparent || !("children" in grandparent)) return layout;

            // Merge with grandparent if they are the same direction
            if (grandparent.direction === newChildren[0].direction) {
                const parentIndex = _.last(parentPath)!;
                const updatedLayout = {
                    ...grandparent,
                    children: [
                        ...grandparent.children.slice(0, parentIndex),
                        ...newChildren[0].children,
                        ...grandparent.children.slice(parentIndex + 1),
                    ] as Children<LaymanLayout>,
                };
                if (grandparentPath.length == 0) {
                    return updatedLayout;
                }
                return _.set(_.cloneDeep(layout), grandparentLodashPath, updatedLayout);
            } else {
                if (grandparentPath.length == 0) {
                    return newChildren[0];
                }
                return _.set(_.cloneDeep(layout), parentLodashPath, newChildren[0]);
            }
        }

        case "moveWindow": {
            const window: LaymanLayout = getLayoutAtPath(layout, action.path);
            if (!window || !("tabs" in window)) return layout;

            const removeWindowLayout = LayoutReducer(layout, {
                type: "removeWindow",
                path: action.path,
            });

            const adjustPath = (layout: LaymanLayout, originalPath: LaymanPath, newPath: LaymanPath) => {
                console.log("originalPath: ", originalPath.join("."));
                console.log("newPath: ", newPath.join("."));

                const commonLength = _.takeWhile(originalPath, (val, idx) => val === newPath[idx]).length;

                if (commonLength != originalPath.length - 1) {
                    if (commonLength != originalPath.length - 2) {
                        return newPath;
                    }

                    const adjustedPath = _.clone(newPath);

                    const parentPath = _.dropRight(action.path);
                    const parent = getLayoutAtPath(layout, parentPath);
                    if (!parent || !("children" in parent)) return adjustedPath;

                    const grandparentPath = _.dropRight(parentPath);
                    const grandparent = getLayoutAtPath(layout, grandparentPath);
                    if (!grandparent || !("children" in grandparent)) return adjustedPath;

                    const onlyChild = parent.children[_.last(originalPath) == 1 ? 0 : 1];

                    if (!onlyChild || !("children" in onlyChild)) {
                        return adjustedPath;
                    }

                    if (grandparent.direction === onlyChild.direction) {
                        if (adjustedPath[commonLength] > originalPath[commonLength]) {
                            adjustedPath[commonLength] += onlyChild.children.length - 1;
                        }
                        return adjustedPath;
                    }
                }
                const adjustedPath = _.clone(newPath);

                // If the original path is further into the parent split,
                // decrement the index in newPath
                if (newPath[commonLength] > originalPath[commonLength]) {
                    adjustedPath[commonLength] = newPath[commonLength] - 1;
                }

                // originalPath's parent had two children, only child moved up
                const parentPath = _.dropRight(originalPath);
                const parent = getLayoutAtPath(layout, parentPath);
                if (!parent || !("children" in parent)) {
                    return adjustedPath;
                }

                // Remove parent from path
                if (parent.children.length == 2) {
                    adjustedPath.splice(commonLength, 1);

                    // Grandparent and only child share direction, moves up again
                    const grandparentPath = _.dropRight(parentPath);
                    const grandparent = getLayoutAtPath(layout, grandparentPath);
                    if (!grandparent || !("children" in grandparent)) {
                        return adjustedPath;
                    }

                    const onlyChild = parent.children[_.last(originalPath) == 1 ? 0 : 1];

                    if (!onlyChild || !("children" in onlyChild)) {
                        return adjustedPath;
                    }

                    // Merge with grandparent if they are the same direction
                    if (grandparent.direction === onlyChild.direction) {
                        adjustedPath[commonLength - 1] += adjustedPath[commonLength];
                        adjustedPath.splice(commonLength, 1);
                    }
                }

                return adjustedPath;
            };

            // Handle removing window causes newPath to change
            const newPath = adjustPath(layout, action.path, action.newPath);

            console.log("new newPath: ", newPath.join("."));

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

        case "moveSeparator": {
            const node: LaymanLayout = getLayoutAtPath(layout, action.path);
            if (!node || !("children" in node)) return layout;

            const lodashPath = "children." + action.path.join(".children.");

            // Get existing view percents
            const numChildren = node.children.length;
            const leftViewPercent = node.children[action.index].viewPercent ?? 100 / numChildren;
            const rightViewPercent = node.children[action.index + 1].viewPercent ?? 100 / numChildren;

            // Calculate new view percents based on the action's new split percentage
            const newLeftViewPercent = action.newSplitPercentage;
            const newRightViewPercent = leftViewPercent + rightViewPercent - newLeftViewPercent;

            // Create a deep clone of the node to avoid mutating the original object directly
            const updatedNode = _.cloneDeep(node);

            // Update the viewPercent for the left and right children
            updatedNode.children[action.index].viewPercent = newLeftViewPercent;
            updatedNode.children[action.index + 1].viewPercent = newRightViewPercent;

            // Use Lodash set to apply the updated node at the correct path in the layout
            if (action.path.length == 0) {
                return updatedNode;
            } else {
                return _.set(_.cloneDeep(layout), lodashPath, updatedNode);
            }
        }

        default: {
            throw new Error("Unknown action: " + action);
        }
    }
};

export const LaymanProvider = ({initialLayout, renderPane, renderTab, children}: LaymanProviderProps) => {
    const [layout, layoutDispatch] = useReducer(LayoutReducer, initialLayout);
    const [laymanRef, setLaymanRef] = useState<React.RefObject<HTMLElement>>();
    const [dropHighlightPosition, setDropHighlightPosition] = useState<Position>({
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
                <DropHighlight position={dropHighlightPosition} isDragging={isDragging} />
                <div id="drag-window-border"></div>
                {children}
            </DndProvider>
        </LaymanContext.Provider>
    );
};
