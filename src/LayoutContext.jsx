import {createContext, useContext, useState} from "react";

const LayoutContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({initialLayout, renderPane, children}) => {
    const [layout, setLayout] = useState(initialLayout);

    const addGeneralWindow = (direction, placement, newWindowTabs, path) => {
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
        setLayout(layoutClone);

        console.log("Layout updated with new window:", layoutClone);
    };

    const addRow = (path) => {
        addGeneralWindow("row", "second", ["blank"], path);
    };

    const addColumn = (path) => {
        addGeneralWindow("column", "second", ["blank"], path);
    };

    return (
        <LayoutContext.Provider
            value={{
                layout,
                setLayout,
                addRow,
                addColumn,
                addGeneralWindow,
                renderPane,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};
