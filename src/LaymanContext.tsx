import {
    createContext,
    useEffect,
    useState,
    Dispatch,
    SetStateAction,
} from "react";
import {
    NexusBranch,
    NexusDirection,
    NexusKey,
    NexusKeys,
    NexusLayout,
    NexusPath,
    PaneRenderer,
    TabRenderer,
} from "./types";
import _ from "lodash";

interface LaymanContextType {
    laymanRef: React.RefObject<HTMLElement> | null;
    setLaymanRef: Dispatch<SetStateAction<React.RefObject<HTMLElement> | null>>;
    layout: NexusLayout;
    setLayout: Dispatch<SetStateAction<NexusLayout>>;
    addWindow: (
        direction: NexusDirection,
        placement: NexusBranch,
        newWindowTabs: NexusKeys,
        path: NexusPath
    ) => void;
    globalTabs: NexusKeys;
    addTab: (path: NexusPath, tab: NexusKey) => void;
    removeTab: (
        path: NexusPath,
        tabs: NexusKeys,
        index: number,
        currentTabIndex: number,
        setCurrentTabIndex: Dispatch<SetStateAction<number>>
    ) => void;
    createUniqueTabId: (tabId: NexusKey) => string;
    selectedTabs: NexusKeys;
    setSelectedTabs: Dispatch<SetStateAction<NexusKeys>>;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
}

export const LaymanContext = createContext<LaymanContextType | null>(null);

export const LaymanProvider = ({
    initialLayout,
    renderPane,
    renderTab,
    children,
}: {
    initialLayout: NexusLayout;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    children: React.ReactNode;
}) => {
    const [layout, setLayout] = useState<NexusLayout>(initialLayout);
    const [globalTabs, setGlobalTabs] = useState<NexusKeys>([]);
    const [selectedTabs, setSelectedTabs] = useState<NexusKeys>([]);
    const [laymanRef, setLaymanRef] =
        useState<React.RefObject<HTMLElement> | null>(null);

    // Get all tab ids from initial layout
    useEffect(() => {
        const tabs: NexusKeys = [];

        const traverseLayout = (layout: NexusLayout) => {
            if (Array.isArray(layout)) {
                layout.forEach((tab) => tabs.push(tab));
            } else {
                traverseLayout(layout!.first);
                traverseLayout(layout!.second);
            }
        };
        traverseLayout(layout);

        setGlobalTabs(tabs);
    }, [layout, setGlobalTabs]);

    const createUniqueTabId = (tabId: NexusKey) => {
        let count = 0;
        for (const existingTab of globalTabs) {
            const existingTabParts = existingTab.split(":");
            if (existingTabParts[0] === tabId) {
                const existingTabNumber =
                    parseInt(existingTabParts[1], 10) || 0;
                count = Math.max(existingTabNumber + 1, count + 1);
            }
        }
        return `${tabId}:${count}`;
    };

    //Adds a new window to the layout at the specified path, on the specified placement.s
    const addWindow = (
        direction: NexusDirection,
        placement: NexusBranch,
        newWindowTabs: NexusKeys,
        path: NexusPath
    ) => {
        // Edge case: One window, turn layout from an array into an object
        if (_.isArray(layout)) {
            const newLayout = {
                direction: direction,
                first: placement === "first" ? newWindowTabs : layout,
                second: placement === "second" ? newWindowTabs : layout,
            };
            console.log("Layout updated with new window:", newLayout);
            setLayout(newLayout);
            return;
        }
        // Create the updater function based on the placement
        const updater =
            placement === "first"
                ? (value: NexusLayout) => ({
                      direction: direction,
                      first: newWindowTabs,
                      second: value,
                  })
                : (value: NexusLayout) => ({
                      direction: direction,
                      first: value,
                      second: newWindowTabs,
                  });

        // Update the layout in the state using _.update
        const newLayout = _.update(layout, path.join("."), updater);

        // Update the layout in the state
        console.log("Updated layout:", newLayout);
        setLayout({...newLayout});
    };

    //Adds a new tab at the specified path within the layout.
    const addTab = (path: NexusPath, tab: NexusKey) => {
        // Edge case: One window, layout is just an array
        if (_.isArray(layout)) {
            layout.push(tab);
            console.log("Updated layout:", layout);
            setLayout([...layout]);
            return;
        }
        const layoutTabList: NexusLayout = _.get(layout, path.join("."), []);
        if (_.isArray(layoutTabList)) {
            layoutTabList.push(tab);
            console.log("Updated layout:", layout);
            setLayout({...layout});
        }
    };

    // Removes a tab at the specified index and path. If the last tab is removed, it collapses the parent container.
    const removeTab = (
        path: NexusPath,
        tabs: NexusKeys,
        index: number,
        currentTabIndex: number,
        setCurrentTabIndex: any
    ) => {
        // Edge case: One window, remove tab directly from layout array
        if (_.isArray(layout)) {
            console.log("Updated layout:", _.without(layout, tabs[index]));
            setLayout(_.without(layout, tabs[index]));
            return;
        }
        // Get the tab list within the layout based on the path
        const layoutTabList: NexusLayout = _.get(layout, path.join("."), []);

        // If layoutTabList is not an array, return
        if (!Array.isArray(layoutTabList)) return;

        // Reomve tab at specified index
        layoutTabList.splice(index, 1);

        // Check if the tab list is empty
        if (layoutTabList.length === 0) {
            // Get the parent node
            const parentPath = _.dropRight(path);
            const parent: NexusLayout = _.get(layout, parentPath);

            if (!parent) {
                // Make TypeScript happy about the layout not being an array
                if (_.isArray(layout)) return;
                // Simply set layout to first window's tabs
                console.log(
                    "Updated layout:",
                    path[0] === "first" ? layout.second : layout.first
                );
                setLayout(path[0] === "first" ? layout.second : layout.first);
                return;
            }

            // If parent is not an object, return
            if (Array.isArray(parent)) return;

            // Determine the side of the removed tab
            const side: NexusBranch =
                _.last(path) === "first" ? "second" : "first";

            // Get the sibling of the removed tab
            const sibling = side === "first" ? parent.first : parent.second;

            // If sibling is not defined, return
            if (!sibling) return;

            // Replace parent with sibling
            if (parentPath.length > 0) {
                _.set(layout, parentPath, sibling);
            } else {
                // Update the layout with sibling if parent is at top level
                console.log("Updated layout:", sibling);
                setLayout({...sibling});
                return;
            }
        }

        console.log("Updated layout:", layout);
        setLayout({...layout});

        // Handle change in selectedTab
        // Remove tab from list of selected tabs, since it doesn't exist anymore
        setSelectedTabs((prevSelectedTabIds: NexusKeys) =>
            prevSelectedTabIds.filter((tab) => tab !== tabs[index])
        );

        // Edge cases: Deleted tab left of selected tab
        if (index == currentTabIndex) {
            if (index == 0) {
                setCurrentTabIndex(0);
            } else {
                setCurrentTabIndex(index - 1);
            }
        } else if (index < currentTabIndex) {
            setCurrentTabIndex(currentTabIndex - 1);
        } else {
            setCurrentTabIndex(currentTabIndex);
        }
    };

    return (
        <LaymanContext.Provider
            value={{
                laymanRef,
                setLaymanRef,
                layout,
                setLayout,
                addWindow,
                globalTabs,
                addTab,
                removeTab,
                createUniqueTabId,
                selectedTabs,
                setSelectedTabs,
                renderPane,
                renderTab,
            }}
        >
            {children}
        </LaymanContext.Provider>
    );
};
