import {
    AddTabAction,
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
import _ from "lodash";

/**
 * Helper function to get nested layout object at a path
 */
const getLayoutAtPath = (layout: LaymanLayout, path: LaymanPath) => {
    if (path.length === 0) return layout;
    const lodashPath = "children." + path.join(".children.");
    return _.get(layout, lodashPath);
};

const addTab = (layout: LaymanLayout, action: AddTabAction) => {
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
};

const removeTab = (layout: LaymanLayout, action: RemoveTabAction) => {
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
        return _.set(_.cloneDeep(layout), lodashPath, updatedLayout);
    }
};

const selectTab = (layout: LaymanLayout, action: SelectTabAction) => {
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
};

const moveTab = (layout: LaymanLayout, action: MoveTabAction) => {
    const window: LaymanLayout = getLayoutAtPath(layout, action.path);
    if (!window || !("tabs" in window)) return layout;

    const removeTabLayout = LaymanReducer(layout, {
        type: "removeTab",
        path: action.path,
        tab: action.tab,
    });

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
    const parentPath = _.dropRight(action.path);
    const parentLodashPath = "children." + parentPath.join(".children.");
    const parent: LaymanLayout = getLayoutAtPath(layout, parentPath);
    if (!parent || !("children" in parent)) return layout;

    // Get split percentage of dragged window to calculate new split percentages
    const removedWindow = parent.children.find((_child, index) => index === _.last(action.path));
    const removedWindowSplitPercentage = removedWindow ? removedWindow.viewPercent : undefined;

    // Remove the child layout since it has no tabs
    const newChildren = parent.children
        .filter((_value, index) => index !== _.last(action.path))
        .map((child) => {
            console.dir({
                viewPercent: child.viewPercent,
                removed: removedWindowSplitPercentage,
            });
            console.log(
                `${child.viewPercent} => ${
                    removedWindowSplitPercentage
                        ? ((child.viewPercent ? child.viewPercent : 100 / parent.children.length) * 100) /
                          (100 - removedWindowSplitPercentage)
                        : ((child.viewPercent ? child.viewPercent : 100 / parent.children.length) *
                              parent.children.length) /
                          (parent.children.length - 1)
                }`
            );
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
        return _.set(_.cloneDeep(layout), parentLodashPath, updatedLayout);
    }
    const onlyChild = newChildren[0];
    // If the only child is a window, replace parent with it
    if ("tabs" in onlyChild) {
        if (parentPath.length == 0) {
            return {...onlyChild, viewPercent: parent.viewPercent};
        }
        return _.set(_.cloneDeep(layout), parentLodashPath, {...onlyChild, viewPercent: parent.viewPercent});
    }

    // Check if "grandparent" is same direction as new parent
    const grandparentPath = _.dropRight(parentPath);
    const grandparentLodashPath = "children." + grandparentPath.join(".children.");
    const grandparent: LaymanLayout = getLayoutAtPath(layout, grandparentPath);
    if (!grandparent || !("children" in grandparent)) return layout;

    // Merge with grandparent if they are the same direction
    if (grandparent.direction === onlyChild.direction) {
        const parentIndex = _.last(parentPath)!;
        const updatedLayout = {
            ...grandparent,
            children: [
                ...grandparent.children.slice(0, parentIndex).map((child) => ({
                    ...child,
                    viewPercent: child.viewPercent
                        ? (child.viewPercent * grandparent.children.length) / (grandparent.children.length - 1)
                        : child.viewPercent,
                })),
                ...onlyChild.children.map((child) => ({
                    ...child,
                    viewPercent:
                        child.viewPercent && parent.viewPercent
                            ? (child.viewPercent * parent.viewPercent) / 100
                            : child.viewPercent,
                })),
                ...grandparent.children.slice(parentIndex + 1).map((child) => ({
                    ...child,
                    viewPercent: child.viewPercent
                        ? (child.viewPercent * grandparent.children.length) / (grandparent.children.length - 1)
                        : child.viewPercent,
                })),
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
};
const addWindow = (layout: LaymanLayout, action: AddWindowAction) => {
    const parentLodashPath = "children." + _.dropRight(action.path).join(".children.");
    const parent: LaymanLayout = getLayoutAtPath(layout, _.dropRight(action.path));
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
    const index =
        action.placement === "bottom" || action.placement === "right" ? _.last(action.path)! + 1 : _.last(action.path)!;

    if ((isColumnPlacement && parent.direction === "column") || (!isColumnPlacement && parent.direction === "row")) {
        // View percent of new window based on length of parent
        const updatedLayout = {
            ...parent,
            children: [
                ...parent.children.slice(0, index).map((child) => ({
                    ...child,
                    viewPercent: child.viewPercent
                        ? (child.viewPercent * parent.children.length) / (parent.children.length + 1)
                        : child.viewPercent,
                })),
                {...action.window, viewPercent: 100 / (parent.children.length + 1)},
                ...parent.children.slice(index).map((child) => ({
                    ...child,
                    viewPercent: child.viewPercent
                        ? (child.viewPercent * parent.children.length) / (parent.children.length + 1)
                        : child.viewPercent,
                })),
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
                ? [action.window, {...window, viewPercent: 50}]
                : [{...window, viewPercent: 50}, action.window];
        const updatedLayout = {
            ...parent,
            children: parent.children.map((child, index) =>
                index === _.last(action.path)
                    ? {
                          direction: isColumnPlacement ? "column" : "row",
                          children: newChildren,
                          viewPercent: window.viewPercent,
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
};

/**
 * Helper function for moveWindow to adjust windows for new layout, using their new paths
 */
const adjustPath = (layout: LaymanLayout, action: MoveWindowAction) => {
    const originalPath = action.path;
    const newPath = action.newPath;
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

const moveWindow = (layout: LaymanLayout, action: MoveWindowAction) => {
    const window: LaymanLayout = getLayoutAtPath(layout, action.path);
    if (!window || !("tabs" in window)) return layout;

    const removeWindowLayout = LaymanReducer(layout, {
        type: "removeWindow",
        path: action.path,
    });

    // Handle removing window causes newPath to change
    const newPath = adjustPath(layout, action);

    console.log("new newPath: ", newPath.join("."));

    if (action.placement === "center") {
        // Add all tabs
        let updatedLayout = _.cloneDeep(removeWindowLayout);

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
        default:
            throw new Error("Unknown action: " + action);
    }
};
