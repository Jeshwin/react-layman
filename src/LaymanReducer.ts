import {
    AddTabAction,
    AddTabActionWithHeuristic,
    AddWindowAction,
    Children,
    LaymanLayout,
    LaymanLayoutAction,
    LaymanPath,
    MoveSeparatorAction,
    MoveTabAction,
    MoveWindowAction,
    RemoveTabAction,
    RemoveWindowAction,
    SelectTabAction,
} from "./types";
import {klona} from "klona";

/**
 * Helper function to get nested layout object at a path.
 * Path [0, 1] means layout.children[0].children[1]
 */
const getLayoutAtPath = (layout: LaymanLayout, path: LaymanPath): LaymanLayout => {
    let current = layout;
    for (let i = 0; i < path.length; i++) {
        if (!current || !("children" in current)) return undefined;
        current = current.children[path[i]];
    }
    return current;
};

/**
 * Helper function to set a value at a nested path, returning a new cloned layout.
 * Path [0, 1] sets layout.children[0].children[1] = value
 */
const setAtPath = (layout: LaymanLayout, path: LaymanPath, value: LaymanLayout): LaymanLayout => {
    const cloned = klona(layout);
    let current = cloned;
    for (let i = 0; i < path.length - 1; i++) {
        if (!current || !("children" in current)) return cloned;
        current = current.children[path[i]];
    }
    if (!current || !("children" in current)) return cloned;
    current.children[path[path.length - 1]] = value;
    return cloned;
};

const addTab = (layout: LaymanLayout, action: AddTabAction) => {
    if (!layout) {
        // Add a tab to a null path
        return {
            tabs: [action.tab],
        };
    }
    const window: LaymanLayout = getLayoutAtPath(layout, action.path);
    if (!window || !("tabs" in window)) return layout;

    const updatedLayout = {
        ...window,
        tabs: [...window.tabs, action.tab],
    };

    if (action.path.length == 0) {
        return updatedLayout;
    } else {
        return setAtPath(layout, action.path, updatedLayout);
    }
};

const removeTab = (layout: LaymanLayout, action: RemoveTabAction) => {
    if (!layout) return layout;
    const window: LaymanLayout = getLayoutAtPath(layout, action.path);
    if (!window || !("tabs" in window)) return layout;

    // Create a new array of tabs without the removed tab
    const updatedTabs = window.tabs.filter((tab) => tab.id !== action.tab.id);

    // Adjust selectedIndex only if the removed tab is
    // to the left of the selected one
    let updatedSelectedIndex = window.selectedIndex;
    const removedTabIndex = window.tabs.indexOf(action.tab);

    if (window.selectedIndex && removedTabIndex <= window.selectedIndex) {
        updatedSelectedIndex = Math.max(0, window.selectedIndex - 1);
    }

    // If no more tabs exist, remove the window itself
    if (updatedTabs.length === 0) {
        return LaymanReducer(layout, {
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
        return setAtPath(layout, action.path, updatedLayout);
    }
};

const selectTab = (layout: LaymanLayout, action: SelectTabAction) => {
    if (!layout) return layout;
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
        return setAtPath(layout, action.path, updatedLayout);
    }
};

const moveTab = (layout: LaymanLayout, action: MoveTabAction) => {
    if (!layout) return layout;
    const window: LaymanLayout = getLayoutAtPath(layout, action.newPath);
    if (!window || !("tabs" in window)) return layout;

    // Remove tab from original path if it came from within the layout
    // If it was added externally, action.path must be [-1], so we skip
    let removeTabLayout = layout;
    if (!(action.path.length === 1 && action.path[0] === -1)) {
        removeTabLayout = LaymanReducer(layout, {
            type: "removeTab",
            path: action.path,
            tab: action.tab,
        })!;
    }

    if (action.placement === "center") {
        return addTab(removeTabLayout, {
            type: "addTab",
            path: action.newPath,
            tab: action.tab,
        });
    } else {
        return addWindow(removeTabLayout, {
            type: "addWindow",
            path: action.newPath,
            window: {
                tabs: [action.tab],
                selectedIndex: 0,
            },
            placement: action.placement,
        });
    }
};

const removeWindow = (layout: LaymanLayout, action: RemoveWindowAction) => {
    if (!layout) return layout;
    const parentPath = action.path.slice(0, -1);
    const parent: LaymanLayout = getLayoutAtPath(layout, parentPath);
    if (!parent || !("children" in parent)) {
        // Parent is the base layout, delete the layout
        return undefined;
    }

    // Get split percentage of dragged window to calculate new split percentages
    const lastIndex = action.path[action.path.length - 1];
    const removedWindow = parent.children.find((_child, index) => index === lastIndex);
    const removedWindowSplitPercentage = removedWindow ? removedWindow.viewPercent : undefined;

    // Remove the child layout since it has no tabs
    const newChildren = parent.children
        .filter((_value, index) => index !== lastIndex)
        .map((child) => {
            if (!child) return;

            return {
                ...child,
                viewPercent: removedWindowSplitPercentage
                    ? ((child.viewPercent ? child.viewPercent : 100 / parent.children.length) * 100) /
                      (100 - removedWindowSplitPercentage)
                    : ((child.viewPercent ? child.viewPercent : 100 / parent.children.length) *
                          parent.children.length) /
                      (parent.children.length - 1),
            };
        });

    if (newChildren.length != 1) {
        const updatedLayout = {
            ...parent,
            children: newChildren as Children<LaymanLayout>,
        };
        if (parentPath.length == 0) {
            return updatedLayout;
        }
        return setAtPath(layout, parentPath, updatedLayout);
    }
    const onlyChild = newChildren[0]!;
    // If the only child is a window, replace parent with it
    if ("tabs" in onlyChild) {
        if (parentPath.length == 0) {
            return {...onlyChild, viewPercent: parent.viewPercent};
        }
        return setAtPath(layout, parentPath, {...onlyChild, viewPercent: parent.viewPercent});
    }

    // Check if "grandparent" is same direction as new parent
    const grandparentPath = parentPath.slice(0, -1);
    const grandparent: LaymanLayout = getLayoutAtPath(layout, grandparentPath);
    if (!grandparent || !("children" in grandparent)) return layout;

    // Merge with grandparent if they are the same direction
    if (grandparent.direction === onlyChild.direction) {
        const parentIndex = parentPath[parentPath.length - 1];
        const updatedLayout: LaymanLayout = {
            ...grandparent,
            children: [
                ...grandparent.children.slice(0, parentIndex).map((child) => {
                    if (!child) return;
                    return {
                        ...child,
                        viewPercent: child.viewPercent
                            ? (child.viewPercent * grandparent.children.length) /
                              (grandparent.children.length + onlyChild.children.length - 1)
                            : child.viewPercent,
                    };
                }),
                ...onlyChild.children.map((child) => {
                    if (!child) return;
                    return {
                        ...child,
                        viewPercent: child.viewPercent
                            ? (child.viewPercent * onlyChild.children.length) /
                              (grandparent.children.length + onlyChild.children.length - 1)
                            : child.viewPercent,
                    };
                }),
                ...grandparent.children.slice(parentIndex + 1).map((child) => {
                    if (!child) return;
                    return {
                        ...child,
                        viewPercent: child.viewPercent
                            ? (child.viewPercent * grandparent.children.length) /
                              (grandparent.children.length + onlyChild.children.length - 1)
                            : child.viewPercent,
                    };
                }),
            ] as Children<LaymanLayout>,
        };
        if (grandparentPath.length == 0) {
            return updatedLayout;
        }
        return setAtPath(layout, grandparentPath, updatedLayout);
    } else {
        if (grandparentPath.length == 0) {
            return newChildren[0];
        }
        return setAtPath(layout, parentPath, newChildren[0]);
    }
};
const addWindow = (layout: LaymanLayout, action: AddWindowAction) => {
    if (!layout) return layout;
    const parentPath = action.path.slice(0, -1);
    const parent: LaymanLayout = getLayoutAtPath(layout, parentPath);
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
        } as LaymanLayout;
    }

    const isColumnPlacement = action.placement === "top" || action.placement === "bottom";
    const lastPathIndex = action.path[action.path.length - 1];
    const index =
        action.placement === "bottom" || action.placement === "right" ? lastPathIndex + 1 : lastPathIndex;

    if ((isColumnPlacement && parent.direction === "column") || (!isColumnPlacement && parent.direction === "row")) {
        // View percent of new window based on length of parent
        const updatedLayout = {
            ...parent,
            children: [
                ...parent.children.slice(0, index).map((child) => {
                    if (!child) return;
                    return {
                        ...child,
                        viewPercent: child.viewPercent
                            ? (child.viewPercent * parent.children.length) / (parent.children.length + 1)
                            : child.viewPercent,
                    };
                }),
                {...action.window, viewPercent: 100 / (parent.children.length + 1)},
                ...parent.children.slice(index).map((child) => {
                    if (!child) return;
                    return {
                        ...child,
                        viewPercent: child.viewPercent
                            ? (child.viewPercent * parent.children.length) / (parent.children.length + 1)
                            : child.viewPercent,
                    };
                }),
            ] as Children<LaymanLayout>,
        };
        if (action.path.length == 1) {
            return updatedLayout;
        } else {
            return setAtPath(layout, parentPath, updatedLayout);
        }
    } else {
        const window: LaymanLayout = getLayoutAtPath(layout, action.path);
        if (!window || !("tabs" in window)) return layout;
        const newChildren: Children<LaymanLayout> =
            action.placement === "top" || action.placement === "left"
                ? [action.window, {...window, viewPercent: 50}]
                : [{...window, viewPercent: 50}, action.window];
        const updatedLayout = {
            ...parent,
            children: parent.children.map((child, index) =>
                index === lastPathIndex
                    ? {
                          direction: isColumnPlacement ? "column" : "row",
                          children: newChildren,
                          viewPercent: window.viewPercent,
                      }
                    : child
            ) as Children<LaymanLayout>,
        };
        if (action.path.length == 1) {
            return updatedLayout;
        } else {
            return setAtPath(layout, parentPath, updatedLayout);
        }
    }
};

/**
 * Helper function for moveWindow to adjust windows for new layout, using their new paths
 */
const adjustPath = (layout: LaymanLayout, action: MoveWindowAction) => {
    const originalPath = action.path;
    const newPath = action.newPath;
    let commonLength = 0;
    for (let i = 0; i < originalPath.length; i++) {
        if (originalPath[i] !== newPath[i]) break;
        commonLength++;
    }

    if (commonLength != originalPath.length - 1) {
        if (commonLength != originalPath.length - 2) {
            return newPath;
        }

        const adjustedPath = [...newPath];

        const parentPath = action.path.slice(0, -1);
        const parent = getLayoutAtPath(layout, parentPath);
        if (!parent || !("children" in parent)) return adjustedPath;

        const grandparentPath = parentPath.slice(0, -1);
        const grandparent = getLayoutAtPath(layout, grandparentPath);
        if (!grandparent || !("children" in grandparent)) return adjustedPath;

        const onlyChild = parent.children[originalPath[originalPath.length - 1] == 1 ? 0 : 1];

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
    const adjustedPath = [...newPath];

    // If the original path is further into the parent split,
    // decrement the index in newPath
    if (newPath[commonLength] > originalPath[commonLength]) {
        adjustedPath[commonLength] = newPath[commonLength] - 1;
    }

    // originalPath's parent had two children, only child moved up
    const parentPath = originalPath.slice(0, -1);
    const parent = getLayoutAtPath(layout, parentPath);
    if (!parent || !("children" in parent)) {
        return adjustedPath;
    }

    // Remove parent from path
    if (parent.children.length == 2) {
        adjustedPath.splice(commonLength, 1);

        // Grandparent and only child share direction, moves up again
        const grandparentPath = parentPath.slice(0, -1);
        const grandparent = getLayoutAtPath(layout, grandparentPath);
        if (!grandparent || !("children" in grandparent)) {
            return adjustedPath;
        }

        const onlyChild = parent.children[originalPath[originalPath.length - 1] == 1 ? 0 : 1];

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

const moveWindow = (layout: LaymanLayout, action: MoveWindowAction) => {
    const window: LaymanLayout = getLayoutAtPath(layout, action.path);
    if (!window || !("tabs" in window)) return layout;

    const removeWindowLayout = LaymanReducer(layout, {
        type: "removeWindow",
        path: action.path,
    });

    // Handle removing window causes newPath to change
    const newPath = adjustPath(layout, action);

    if (action.placement === "center") {
        // Add all tabs
        let updatedLayout = klona(removeWindowLayout);

        action.window.tabs.forEach((tab) => {
            updatedLayout = addTab(updatedLayout, {
                type: "addTab",
                path: newPath,
                tab: tab,
            });
        });

        return updatedLayout;
    } else {
        return addWindow(removeWindowLayout, {
            type: "addWindow",
            path: newPath,
            window: action.window,
            placement: action.placement,
        });
    }
};

const moveSeparator = (layout: LaymanLayout, action: MoveSeparatorAction) => {
    if (!layout) return layout;
    const node: LaymanLayout = getLayoutAtPath(layout, action.path);
    if (!node || !("children" in node)) return layout;

    // Get existing view percents
    const numChildren = node.children.length;
    const leftViewPercent = node.children[action.index]!.viewPercent ?? 100 / numChildren;
    const rightViewPercent = node.children[action.index + 1]!.viewPercent ?? 100 / numChildren;

    // Calculate new view percents based on the action's new split percentage
    const newLeftViewPercent = action.newSplitPercentage;
    const newRightViewPercent = leftViewPercent + rightViewPercent - newLeftViewPercent;

    // Create a deep clone of the node to avoid mutating the original object directly
    const updatedNode = klona(node);

    // Update the viewPercent for the left and right children
    updatedNode.children[action.index]!.viewPercent = newLeftViewPercent;
    updatedNode.children[action.index + 1]!.viewPercent = newRightViewPercent;

    // Apply the updated node at the correct path in the layout
    if (action.path.length == 0) {
        return updatedNode;
    } else {
        return setAtPath(layout, action.path, updatedNode);
    }
};

const addTabWithHeuristic = (layout: LaymanLayout, action: AddTabActionWithHeuristic) => {
    if (!layout) {
        return {
            tabs: [action.tab],
        };
    }
    if ("tabs" in layout) {
        return {
            ...layout,
            tabs: [...layout.tabs, action.tab],
            selectedIndex: layout.tabs.length,
        };
    }

    if (action.heuristic === "topleft") {
        const newChildren: Children<LaymanLayout> = [...layout.children];
        newChildren[0] = addTabWithHeuristic(newChildren[0], action);
        return {...layout, children: newChildren};
    } else if (action.heuristic === "topright") {
        const newChildren: Children<LaymanLayout> = [...layout.children];
        if (layout.direction === "column") {
            newChildren[0] = addTabWithHeuristic(newChildren[0], action);
        } else {
            newChildren[newChildren.length - 1] = addTabWithHeuristic(newChildren[newChildren.length - 1], action);
        }
        return {...layout, children: newChildren};
    }
    return layout;
};

const autoArrange = (layout: LaymanLayout): LaymanLayout => {
    if (!layout || "tabs" in layout) {
        return layout;
    }
    const numChildren = layout.children.length;
    const newSplitPercentage = 100 / numChildren;
    return {
        ...layout,
        children: layout.children.map((child) => ({
            ...autoArrange(child),
            viewPercent: newSplitPercentage,
        })) as Children<LaymanLayout>,
    };
};

export const LaymanReducer = (layout: LaymanLayout, action: LaymanLayoutAction): LaymanLayout => {
    switch (action.type) {
        case "addTab":
            return addTab(layout, action);
        case "removeTab":
            return removeTab(layout, action);
        case "selectTab":
            return selectTab(layout, action);
        case "moveTab":
            return moveTab(layout, action);
        case "addWindow":
            return addWindow(layout, action);
        case "removeWindow":
            return removeWindow(layout, action);
        case "moveWindow":
            return moveWindow(layout, action);
        case "moveSeparator":
            return moveSeparator(layout, action);
        case "addTabWithHeuristic":
            return addTabWithHeuristic(layout, action);
        case "autoArrange":
            return autoArrange(layout);
        default:
            throw new Error("Unknown action: " + action);
    }
};
