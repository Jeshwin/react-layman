import {
    AddTabAction,
    AddTabActionWithHeuristic,
    AddWindowAction,
    BringFloatingWindowToFrontAction,
    Children,
    FloatingWindowData,
    LaymanLayout,
    LaymanLayoutAction,
    LaymanPath,
    LaymanState,
    LaymanWindow,
    MoveSeparatorAction,
    MoveTabAction,
    MoveWindowAction,
    RemoveTabAction,
    RemoveWindowAction,
    SelectTabAction,
    SetFloatingWindowPositionAction,
} from "./types";
import {TabData} from "./TabData";
import {deepClone, isFloatingAddress} from "./utils";

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
    const cloned = deepClone(layout);
    let current = cloned;
    for (let i = 0; i < path.length - 1; i++) {
        if (!current || !("children" in current)) return cloned;
        current = current.children[path[i]];
    }
    if (!current || !("children" in current)) return cloned;
    current.children[path[path.length - 1]] = value;
    return cloned;
};

// ---------------------------------------------------------------------------
// Tree helpers: pure functions operating on `LaymanLayout` addressed by a
// `LaymanPath`. These never touch floating windows.
// ---------------------------------------------------------------------------

const treeAddTab = (layout: LaymanLayout, path: LaymanPath, tab: TabData): LaymanLayout => {
    if (!layout) {
        // Add a tab to a null path
        return {
            tabs: [tab],
        };
    }
    const window: LaymanLayout = getLayoutAtPath(layout, path);
    if (!window || !("tabs" in window)) return layout;

    const updatedLayout = {
        ...window,
        tabs: [...window.tabs, tab],
    };

    if (path.length == 0) {
        return updatedLayout;
    } else {
        return setAtPath(layout, path, updatedLayout);
    }
};

const treeRemoveWindow = (layout: LaymanLayout, path: LaymanPath): LaymanLayout => {
    if (!layout) return layout;
    const parentPath = path.slice(0, -1);
    const parent: LaymanLayout = getLayoutAtPath(layout, parentPath);
    if (!parent || !("children" in parent)) {
        // Parent is the base layout, delete the layout
        return undefined;
    }

    // Get the removed window's split percentage so its remaining siblings can
    // be rescaled to fill the space it leaves behind.
    const lastIndex = path[path.length - 1];
    const removedWindow = parent.children.find((_child, index) => index === lastIndex);
    const removedWindowSplitPercentage = removedWindow ? removedWindow.viewPercent : undefined;

    // Remove the child layout since it has no tabs, and rescale the remaining
    // children's percentages to fill the 100% left by the removed sibling. If
    // its split percentage is known, divide by the remaining share (100 minus
    // that percentage); otherwise assume equal sharing and divide by the new,
    // smaller child count instead.
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

const treeRemoveTab = (layout: LaymanLayout, path: LaymanPath, tab: TabData): LaymanLayout => {
    if (!layout) return layout;
    const window: LaymanLayout = getLayoutAtPath(layout, path);
    if (!window || !("tabs" in window)) return layout;

    // Create a new array of tabs without the removed tab
    const updatedTabs = window.tabs.filter((t) => t.id !== tab.id);

    // Adjust selectedIndex only if the removed tab is
    // to the left of the selected one
    let updatedSelectedIndex = window.selectedIndex;
    const removedTabIndex = window.tabs.indexOf(tab);

    // `window.selectedIndex &&` intentionally skips this branch when selectedIndex
    // is 0: if the removed tab was at or before index 0, it must have been the
    // first tab, so the selection should stay at 0 (the new first tab) anyway,
    // which is already the default value of updatedSelectedIndex.
    if (window.selectedIndex && removedTabIndex <= window.selectedIndex) {
        updatedSelectedIndex = Math.max(0, window.selectedIndex - 1);
    }

    // If no more tabs exist, remove the window itself
    if (updatedTabs.length === 0) {
        return treeRemoveWindow(layout, path);
    }

    const updatedLayout = {
        ...window,
        tabs: updatedTabs,
        selectedIndex: updatedSelectedIndex,
    };

    if (path.length == 0) {
        return updatedLayout;
    } else {
        return setAtPath(layout, path, updatedLayout);
    }
};

const treeSelectTab = (layout: LaymanLayout, path: LaymanPath, tab: TabData): LaymanLayout => {
    if (!layout) return layout;
    const window: LaymanLayout = getLayoutAtPath(layout, path);
    if (!window || !("tabs" in window)) return layout;

    // Update selectedIndex in the window
    const updatedLayout = {
        ...window,
        selectedIndex: window.tabs.findIndex((t) => t.id === tab.id),
    };

    if (path.length == 0) {
        return updatedLayout;
    } else {
        return setAtPath(layout, path, updatedLayout);
    }
};

/**
 * Inserts `window` into `children` at `index`, rescaling siblings'
 * viewPercent to make room for it (100 / (n + 1) for the new window; each
 * existing sibling's viewPercent scaled by n / (n + 1)).
 */
const insertChildAt = (children: Children<LaymanLayout>, index: number, window: LaymanWindow): Children<LaymanLayout> => {
    const n = children.length;
    const rescale = (child: LaymanLayout) => {
        if (!child) return child;
        return {
            ...child,
            viewPercent: child.viewPercent ? (child.viewPercent * n) / (n + 1) : child.viewPercent,
        };
    };
    return [
        ...children.slice(0, index).map(rescale),
        {...window, viewPercent: 100 / (n + 1)},
        ...children.slice(index).map(rescale),
    ] as Children<LaymanLayout>;
};

const treeAddWindow = (
    layout: LaymanLayout,
    path: LaymanPath,
    window: LaymanWindow,
    placement: "top" | "bottom" | "left" | "right"
): LaymanLayout => {
    // No tiled layout yet at all: the new window becomes the entire root,
    // regardless of which edge it was dropped on.
    if (!layout) return {...window};

    const parentPath = path.slice(0, -1);
    const parent: LaymanLayout = getLayoutAtPath(layout, parentPath);
    if (!parent) return layout;

    if (!("children" in parent)) {
        // Base layout must be window, adding to this
        const isColumnPlacement = placement === "top" || placement === "bottom";
        const newChildren: Children<LaymanLayout> =
            placement === "top" || placement === "left" ? [window, parent] : [parent, window];
        return {
            direction: isColumnPlacement ? "column" : "row",
            children: newChildren,
        } as LaymanLayout;
    }

    // Root-edge insert (`path: []`) when the root is already a split: there
    // is no parent above the root, so the generic "insert next to one
    // sibling" logic below (which indexes off `path[path.length - 1]`)
    // doesn't apply. Either extend the root split directly (if it's already
    // in the right direction) or wrap the whole existing root as one child
    // of a fresh outer split.
    if (path.length === 0) {
        const isColumnPlacement = placement === "top" || placement === "bottom";
        const matchesDirection =
            (isColumnPlacement && parent.direction === "column") || (!isColumnPlacement && parent.direction === "row");
        if (matchesDirection) {
            const index = placement === "top" || placement === "left" ? 0 : parent.children.length;
            return {...parent, children: insertChildAt(parent.children, index, window)};
        }
        const newChildren: Children<LaymanLayout> =
            placement === "top" || placement === "left" ? [window, parent] : [parent, window];
        return {direction: isColumnPlacement ? "column" : "row", children: newChildren} as LaymanLayout;
    }

    const isColumnPlacement = placement === "top" || placement === "bottom";
    const lastPathIndex = path[path.length - 1];
    const index = placement === "bottom" || placement === "right" ? lastPathIndex + 1 : lastPathIndex;

    if ((isColumnPlacement && parent.direction === "column") || (!isColumnPlacement && parent.direction === "row")) {
        // View percent of new window based on length of parent
        const updatedLayout = {
            ...parent,
            children: insertChildAt(parent.children, index, window),
        };
        if (path.length == 1) {
            return updatedLayout;
        } else {
            return setAtPath(layout, parentPath, updatedLayout);
        }
    } else {
        const existingWindow: LaymanLayout = getLayoutAtPath(layout, path);
        if (!existingWindow || !("tabs" in existingWindow)) return layout;
        const newChildren: Children<LaymanLayout> =
            placement === "top" || placement === "left"
                ? [window, {...existingWindow, viewPercent: 50}]
                : [{...existingWindow, viewPercent: 50}, window];
        const updatedLayout = {
            ...parent,
            children: parent.children.map((child, i) =>
                i === lastPathIndex
                    ? {
                          direction: isColumnPlacement ? "column" : "row",
                          children: newChildren,
                          viewPercent: existingWindow.viewPercent,
                      }
                    : child
            ) as Children<LaymanLayout>,
        };
        if (path.length == 1) {
            return updatedLayout;
        } else {
            return setAtPath(layout, parentPath, updatedLayout);
        }
    }
};

/**
 * Helper function for moveWindow to adjust windows for new layout, using their new paths.
 *
 * `newPath` is computed against the tree as it looked *before* `originalPath`'s window
 * is removed. But removing a window can collapse its parent split (when only one
 * sibling remains, that sibling is promoted up, and if it shares direction with the
 * grandparent, its children are merged directly into the grandparent's children).
 * Both effects shift sibling indices around, so this function re-derives what
 * `newPath` should actually be once those collapses have happened.
 */
const adjustPath = (layout: LaymanLayout, originalPath: LaymanPath, newPath: LaymanPath): LaymanPath => {
    // Length of the path prefix shared by originalPath and newPath, i.e. how many
    // ancestor levels the source and destination have in common.
    let commonLength = 0;
    for (let i = 0; i < originalPath.length; i++) {
        if (originalPath[i] !== newPath[i]) break;
        commonLength++;
    }

    if (commonLength != originalPath.length - 1) {
        // newPath diverges above the immediate parent of originalPath. Only one
        // specific case needs compensation here: newPath diverges exactly at the
        // grandparent level, meaning the destination is a sibling of originalPath's
        // parent. If that parent collapses (see below) and merges into the
        // grandparent, everything after the parent's old slot in the grandparent's
        // children shifts over by however many grandchildren got spliced in.
        if (commonLength != originalPath.length - 2) {
            // Destination doesn't share enough ancestry to be affected by the
            // collapse at originalPath's parent; no adjustment needed.
            return newPath;
        }

        const adjustedPath = [...newPath];

        const parentPath = originalPath.slice(0, -1);
        const parent = getLayoutAtPath(layout, parentPath);
        if (!parent || !("children" in parent)) return adjustedPath;

        const grandparentPath = parentPath.slice(0, -1);
        const grandparent = getLayoutAtPath(layout, grandparentPath);
        if (!grandparent || !("children" in grandparent)) return adjustedPath;

        // The sibling that remains once originalPath's window is removed from its
        // (two-child) parent - this is the one that gets promoted up a level.
        const onlyChild = parent.children[originalPath[originalPath.length - 1] == 1 ? 0 : 1];

        if (!onlyChild || !("children" in onlyChild)) {
            return adjustedPath;
        }

        if (grandparent.direction === onlyChild.direction) {
            // Parent's single slot in the grandparent's children is replaced by
            // all of onlyChild's children, so anything positioned after that slot
            // shifts forward by (onlyChild's child count - 1) slots.
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

const treeMoveSeparator = (layout: LaymanLayout, action: MoveSeparatorAction): LaymanLayout => {
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
    const updatedNode = deepClone(node);

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

const treeAddTabWithHeuristic = (layout: LaymanLayout, action: AddTabActionWithHeuristic): LaymanLayout => {
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
        newChildren[0] = treeAddTabWithHeuristic(newChildren[0], action);
        return {...layout, children: newChildren};
    } else if (action.heuristic === "topright") {
        const newChildren: Children<LaymanLayout> = [...layout.children];
        if (layout.direction === "column") {
            newChildren[0] = treeAddTabWithHeuristic(newChildren[0], action);
        } else {
            newChildren[newChildren.length - 1] = treeAddTabWithHeuristic(newChildren[newChildren.length - 1], action);
        }
        return {...layout, children: newChildren};
    }
    return layout;
};

const treeAutoArrange = (layout: LaymanLayout): LaymanLayout => {
    if (!layout || "tabs" in layout) {
        return layout;
    }
    const numChildren = layout.children.length;
    const newSplitPercentage = 100 / numChildren;
    return {
        ...layout,
        children: layout.children.map((child) => ({
            ...treeAutoArrange(child),
            viewPercent: newSplitPercentage,
        })) as Children<LaymanLayout>,
    };
};

// ---------------------------------------------------------------------------
// Floating helpers: pure functions operating on the `floatingWindows` array,
// addressed by `floatingId`.
// ---------------------------------------------------------------------------

const nextFloatingZIndex = (floatingWindows: FloatingWindowData[]): number =>
    floatingWindows.reduce((max, fw) => Math.max(max, fw.zIndex), 29) + 1;

const floatingAddTab = (floatingWindows: FloatingWindowData[], floatingId: string, tab: TabData): FloatingWindowData[] =>
    floatingWindows.map((fw) => (fw.id === floatingId ? {...fw, tabs: [...fw.tabs, tab]} : fw));

const floatingRemoveTab = (
    floatingWindows: FloatingWindowData[],
    floatingId: string,
    tab: TabData
): FloatingWindowData[] => {
    const floatingWindow = floatingWindows.find((fw) => fw.id === floatingId);
    if (!floatingWindow) return floatingWindows;

    const updatedTabs = floatingWindow.tabs.filter((t) => t.id !== tab.id);

    // If no tabs remain, the floating window closes itself.
    if (updatedTabs.length === 0) {
        return floatingWindows.filter((fw) => fw.id !== floatingId);
    }

    let updatedSelectedIndex = floatingWindow.selectedIndex;
    const removedTabIndex = floatingWindow.tabs.indexOf(tab);
    if (removedTabIndex <= floatingWindow.selectedIndex) {
        updatedSelectedIndex = Math.max(0, floatingWindow.selectedIndex - 1);
    }

    return floatingWindows.map((fw) =>
        fw.id === floatingId ? {...fw, tabs: updatedTabs, selectedIndex: updatedSelectedIndex} : fw
    );
};

const floatingSelectTab = (floatingWindows: FloatingWindowData[], floatingId: string, tab: TabData): FloatingWindowData[] =>
    floatingWindows.map((fw) =>
        fw.id === floatingId ? {...fw, selectedIndex: fw.tabs.findIndex((t) => t.id === tab.id)} : fw
    );

const floatingRemoveWindow = (floatingWindows: FloatingWindowData[], floatingId: string): FloatingWindowData[] =>
    floatingWindows.filter((fw) => fw.id !== floatingId);

// ---------------------------------------------------------------------------
// Address-aware action handlers: these dispatch to the tree helpers or the
// floating helpers depending on whether the action's address is a tree path
// or a floating window id, so every window - tiled or floating - is
// addressed, rendered, and mutated through the exact same action types.
// ---------------------------------------------------------------------------

const addTab = (state: LaymanState, action: AddTabAction): LaymanState => {
    if (isFloatingAddress(action.path)) {
        return {...state, floatingWindows: floatingAddTab(state.floatingWindows, action.path.floatingId, action.tab)};
    }
    return {...state, layout: treeAddTab(state.layout, action.path, action.tab)};
};

const removeTab = (state: LaymanState, action: RemoveTabAction): LaymanState => {
    if (isFloatingAddress(action.path)) {
        return {
            ...state,
            floatingWindows: floatingRemoveTab(state.floatingWindows, action.path.floatingId, action.tab),
        };
    }
    return {...state, layout: treeRemoveTab(state.layout, action.path, action.tab)};
};

const selectTab = (state: LaymanState, action: SelectTabAction): LaymanState => {
    if (isFloatingAddress(action.path)) {
        return {
            ...state,
            floatingWindows: floatingSelectTab(state.floatingWindows, action.path.floatingId, action.tab),
        };
    }
    return {...state, layout: treeSelectTab(state.layout, action.path, action.tab)};
};

const removeWindow = (state: LaymanState, action: RemoveWindowAction): LaymanState => {
    if (isFloatingAddress(action.path)) {
        return {...state, floatingWindows: floatingRemoveWindow(state.floatingWindows, action.path.floatingId)};
    }
    return {...state, layout: treeRemoveWindow(state.layout, action.path)};
};

const addWindow = (state: LaymanState, action: AddWindowAction): LaymanState => {
    if (isFloatingAddress(action.path)) {
        // Floating windows are intentionally single-pane; splitting a
        // floating window isn't supported, so this is a no-op.
        return state;
    }
    return {...state, layout: treeAddWindow(state.layout, action.path, action.window, action.placement)};
};

const moveTab = (state: LaymanState, action: MoveTabAction): LaymanState => {
    // Remove the tab from its source, unless it came from outside the
    // layout entirely (external tab sources use the `[-1]` sentinel path).
    const isExternalSource = Array.isArray(action.path) && action.path.length === 1 && action.path[0] === -1;
    const working = isExternalSource ? state : removeTab(state, {type: "removeTab", path: action.path, tab: action.tab});

    if (isFloatingAddress(action.newPath)) {
        const floatingId = action.newPath.floatingId;
        // moveTab only ever merges into an *existing* floating window; to
        // float a tab out into a brand new floating window, float the whole
        // window (see moveWindow) instead.
        if (!working.floatingWindows.some((fw) => fw.id === floatingId)) return working;
        return {...working, floatingWindows: floatingAddTab(working.floatingWindows, floatingId, action.tab)};
    }

    if (!working.layout) return working;
    const destWindow = getLayoutAtPath(working.layout, action.newPath);
    if (!destWindow || !("tabs" in destWindow)) return working;

    if (action.placement === "center") {
        return {...working, layout: treeAddTab(working.layout, action.newPath, action.tab)};
    }
    return {
        ...working,
        layout: treeAddWindow(working.layout, action.newPath, {tabs: [action.tab], selectedIndex: 0}, action.placement),
    };
};

const moveWindow = (state: LaymanState, action: MoveWindowAction): LaymanState => {
    // Step 1: remove the window from its source, and note whether the
    // destination path needs adjusting for shifted tree indices (only
    // relevant when the window was removed from *within* the same tree).
    let working: LaymanState;
    let sourceWasTreePath: LaymanPath | undefined;
    if (isFloatingAddress(action.path)) {
        working = {...state, floatingWindows: floatingRemoveWindow(state.floatingWindows, action.path.floatingId)};
    } else {
        const window: LaymanLayout = getLayoutAtPath(state.layout, action.path);
        if (!window || !("tabs" in window)) return state;
        working = {...state, layout: treeRemoveWindow(state.layout, action.path)};
        sourceWasTreePath = action.path;
    }

    // Step 2a: destination is a floating window (new or existing).
    if (isFloatingAddress(action.newPath)) {
        const floatingId = action.newPath.floatingId;
        const existing = working.floatingWindows.find((fw) => fw.id === floatingId);
        if (existing) {
            // Merge tabs into the already-floating destination. Floating
            // windows are single-pane, so `placement` doesn't matter here.
            return {
                ...working,
                floatingWindows: working.floatingWindows.map((fw) =>
                    fw.id === floatingId ? {...fw, tabs: [...fw.tabs, ...action.window.tabs]} : fw
                ),
            };
        }
        // No floating window with this id exists yet: this is a "float this
        // window" move. `position` must be supplied to seed its rect.
        if (!action.position) return state;
        const newFloatingWindow: FloatingWindowData = {
            id: floatingId,
            tabs: action.window.tabs,
            selectedIndex: action.window.selectedIndex ?? 0,
            position: action.position,
            zIndex: nextFloatingZIndex(working.floatingWindows),
        };
        return {...working, floatingWindows: [...working.floatingWindows, newFloatingWindow]};
    }

    // Step 2b: destination is a tree path. Removing a tree-sourced window can
    // shift sibling indices, so the destination path needs adjusting; a
    // floating source never shifts tree indices.
    const destPath = sourceWasTreePath
        ? adjustPath(state.layout, sourceWasTreePath, action.newPath)
        : action.newPath;

    if (action.placement === "center") {
        let updatedLayout = deepClone(working.layout);
        action.window.tabs.forEach((tab) => {
            updatedLayout = treeAddTab(updatedLayout, destPath, tab);
        });
        return {...working, layout: updatedLayout};
    }
    return {...working, layout: treeAddWindow(working.layout, destPath, action.window, action.placement)};
};

const setFloatingWindowPosition = (state: LaymanState, action: SetFloatingWindowPositionAction): LaymanState => ({
    ...state,
    floatingWindows: state.floatingWindows.map((fw) =>
        fw.id === action.floatingId ? {...fw, position: action.position} : fw
    ),
});

const bringFloatingWindowToFront = (state: LaymanState, action: BringFloatingWindowToFrontAction): LaymanState => {
    const topZ = state.floatingWindows.reduce((max, fw) => Math.max(max, fw.zIndex), 29);
    const target = state.floatingWindows.find((fw) => fw.id === action.floatingId);
    if (!target || (target.zIndex === topZ && topZ !== 29)) return state;
    return {
        ...state,
        floatingWindows: state.floatingWindows.map((fw) =>
            fw.id === action.floatingId ? {...fw, zIndex: topZ + 1} : fw
        ),
    };
};

export const LaymanReducer = (state: LaymanState, action: LaymanLayoutAction): LaymanState => {
    switch (action.type) {
        case "addTab":
            return addTab(state, action);
        case "removeTab":
            return removeTab(state, action);
        case "selectTab":
            return selectTab(state, action);
        case "moveTab":
            return moveTab(state, action);
        case "addWindow":
            return addWindow(state, action);
        case "removeWindow":
            return removeWindow(state, action);
        case "moveWindow":
            return moveWindow(state, action);
        case "moveSeparator":
            return {...state, layout: treeMoveSeparator(state.layout, action)};
        case "addTabWithHeuristic":
            return {...state, layout: treeAddTabWithHeuristic(state.layout, action)};
        case "autoArrange":
            return {...state, layout: treeAutoArrange(state.layout)};
        case "setFloatingWindowPosition":
            return setFloatingWindowPosition(state, action);
        case "bringFloatingWindowToFront":
            return bringFloatingWindowToFront(state, action);
        default:
            throw new Error("Unknown action: " + action);
    }
};
