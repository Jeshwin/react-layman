import {createContext, useContext, useEffect, useState} from "react";

const LayoutContext = createContext(null);

// Custom hook to provide easy access to the layout context.
export const useLayout = () => useContext(LayoutContext);

/**
 * Provides a context provider for layout management across a React application.
 * @param {Object} props - The props object.
 * @param {Array} props.initialLayout - Initial state of the layout.
 * @param {Function} props.renderPane - Function to render panes in the layout.
 * @param {Function} props.renderTab - Function to render tabs within panes.
 * @param {React.MutableRefObject} props.nexusRef - Reference to parent Nexus node
 * @param {ReactNode} props.children - Child components that may consume layout context.
 */
export const LayoutProvider = ({
    initialLayout,
    renderPane,
    renderTab,
    nexusRef,
    children,
}) => {
    // State to hold the current layout, initialized to initialLayout.
    const [layout, setLayout] = useState(initialLayout);
    const [globalTabList, setGlobalTabList] = useState([]);
    const [selectedTabIds, setSelectedTabIds] = useState([]);

    // Convert layout from a binary tree object into three lists
    useEffect(() => {
        setGlobalTabList(getAllTabs(layout));
    }, [layout]);

    // Gets all tab ids in layout
    // Also verifies that all tab ids are unique
    // If identical tab ids found, throw an exception
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

    return (
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
            {children}
        </LayoutContext.Provider>
    );
};
