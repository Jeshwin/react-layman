import {createContext, useEffect, useRef, useState} from "react";
import WindowToolbar from "./WindowToolbar";
import Window from "./Window";
import Separator from "./Separator";
import {Inset} from "./Insets";

export const LayoutContext = createContext(null);

/**
 * @description Renders the main layout container of a Nexus application, providing context to child components for managing layouts and panes.
 * @component
 * @param {Object} props - Component props.
 * @param {Object|null} props.initialLayout - Initial layout state passed down from parent component.
 * @param {Function} props.renderPane - Function for rendering individual panes within the layout.
 * @param {Function} props.renderTab - Function for rendering tabs within the layout.
 * @return {JSX.Element} Rendered Nexus layout container with provided context.
 */
export default function Nexus({initialLayout, renderPane, renderTab}) {
    const nexusRef = useRef(null);
    const [layout, setLayout] = useState(initialLayout);
    const [globalTabList, setGlobalTabList] = useState([]);
    const [selectedTabIds, setSelectedTabIds] = useState([]);

    // Convert layout from a binary tree object into three lists
    useEffect(() => {
        setGlobalTabList(getAllTabs(layout));
    }, [layout]);

    /**
     * Gets a list of all tab ids in layout
     * @param {Object} layout - The nested binary tree layout
     * @return {Array} a list of all tab ids in layout
     */
    const getAllTabs = (layout) => {
        const tabs = [];

        const traverseLayout = (layout) => {
            if (layout.direction) {
                traverseLayout(layout.first);
                traverseLayout(layout.second);
            } else {
                layout.forEach((tab) => tabs.push(tab));
            }
        };
        traverseLayout(layout);

        return tabs;
    };

    /**
     * Adds a new general window to the layout at the specified path.
     * @param {string} direction - The direction of the split ('row' or 'column').
     * @param {string} placement - Where to place the new window ('first' or 'second').
     * @param {Array} newWindowTabs - Array of tabs for the new window.
     * @param {Array} path - Path in the layout tree to the target window.
     */
    const addWindow = (direction, placement, newWindowTabs, path) => {
        const layoutClone = structuredClone(layout); // Clone the current layout to avoid direct state mutation
        let target = layoutClone; // This will be used to drill down to the target window

        // Navigate to the parent of the target window
        const parentPath = path.slice(0, -1);
        for (const index of parentPath) {
            target = target[index];
        }

        // Identify the target window within its parent
        const targetWindowKey = path[path.length - 1];
        const originalWindow = target[targetWindowKey];

        // Create a new division at this level
        const newDivision = {
            direction: direction,
            [placement]: newWindowTabs, // The new window becomes 'first' or 'second' based on 'placement'
            [placement === "first" ? "second" : "first"]: originalWindow, // The existing window takes the opposite position
        };

        // Replace the original window with the new division
        target[targetWindowKey] = newDivision;

        // Update the layout in the state
        console.log("Layout updated with new window:", layoutClone);
        setLayout(layoutClone);
    };

    /**
     * Adds a new tab at the specified path within the layout.
     * @param {Array} path - Path to the tab list within the layout where the new tab should be added.
     * @param {string} tabName - Name of the new tab to add.
     */
    const addTab = (path, tabName) => {
        let layoutClone = structuredClone(layout);
        let layoutTabList = layoutClone;
        for (const index of path) {
            layoutTabList = layoutTabList[index];
        }
        layoutTabList.push(tabName);
        console.log("Updated layout:", layoutClone);
        setLayout(layoutClone);
    };

    /**
     * Removes a tab at the specified index and path. If the last tab is removed, it collapses the parent container.
     * @param {Array} path - Path to the tab list within the layout where the tab should be removed.
     * @param {number} index - Index of the tab to be removed.
     */
    const removeTab = (path, index) => {
        let layoutClone = structuredClone(layout);
        let layoutTabList = layoutClone;
        for (const index of path) {
            layoutTabList = layoutTabList[index];
        }

        layoutTabList.splice(index, 1); // Reomve tab and index
        if (layoutTabList.length === 0) {
            // Navigate to the parent node
            let parentPath = path.slice(0, -1);
            let parent = layoutClone;
            for (const idx of parentPath) {
                parent = parent[idx];
            }

            // Determine which side this node was on and its sibling
            const side = path[path.length - 1];
            const siblingSide = side === "first" ? "second" : "first";
            const sibling = parent[siblingSide];

            // Replace the parent node with the sibling node
            if (parentPath.length > 0) {
                const grandParentPath = parentPath.slice(0, -1);
                let grandParent = layoutClone;
                for (const idx of grandParentPath) {
                    grandParent = grandParent[idx];
                }
                const parentSide = parentPath[parentPath.length - 1];
                grandParent[parentSide] = sibling;
            } else {
                // We're at the top level of layout
                layoutClone = sibling;
            }
        }

        console.log("Updated layout:", layoutClone);
        setLayout(layoutClone);
    };

    const renderLayout = (layout) => {
        const separators = [];
        const toolbars = [];
        const panes = [];

        function traverseLayout(layout, inset, path) {
            if (layout.direction) {
                separators.push(
                    <Separator
                        key={path.length != 0 ? path.join(":") : "root"}
                        parentInset={inset}
                        splitPercentage={layout.splitPercentage ?? 50}
                        direction={layout.direction}
                        path={path}
                    />
                );
                const {firstInset, secondInset} = inset.newInsets(
                    layout.splitPercentage ?? 50,
                    layout.direction
                );
                traverseLayout(
                    layout.first,
                    firstInset,
                    path.concat(["first"])
                );
                traverseLayout(
                    layout.second,
                    secondInset,
                    path.concat(["second"])
                );
            } else {
                toolbars.push(
                    <WindowToolbar
                        key={path.join(":")}
                        inset={inset}
                        path={path}
                        tabs={layout}
                    />
                );
                layout.map((tab) =>
                    panes.push(
                        <Window
                            key={path.join(":") + ":" + tab}
                            inset={inset}
                            tab={tab}
                            path={path}
                        />
                    )
                );
            }
        }

        traverseLayout(layout, new Inset({}), []);
        return [separators, toolbars, panes];
    };

    return (
        <div ref={nexusRef} className="w-full h-full relative overflow-hidden">
            <LayoutContext.Provider
                value={{
                    layout,
                    setLayout,
                    addWindow,
                    addTab,
                    removeTab,
                    renderPane,
                    renderTab,
                    nexusRef,
                    globalTabList,
                    selectedTabIds,
                    setSelectedTabIds,
                }}
            >
                {renderLayout(layout)}
            </LayoutContext.Provider>
        </div>
    );
}
