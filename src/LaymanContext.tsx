import {
    Dispatch,
    SetStateAction,
    createContext,
    useEffect,
    useState,
} from "react";
import {
    LaymanBranch,
    LaymanContextType,
    LaymanDirection,
    LaymanTabs,
    LaymanLayout,
    LaymanPath,
    PaneRenderer,
    TabRenderer,
} from "./types";
import _ from "lodash";
import {TabData} from "./TabData";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

// Define default values for the context
const defaultContextValue: LaymanContextType = {
    laymanRef: null,
    setLaymanRef: () => {},
    layout: [],
    setLayout: () => {},
    addWindow: () => {},
    globalTabs: [],
    setGlobalTabs: () => {},
    addTab: () => {},
    removeTab: () => {},
    renderPane: () => <></>,
    renderTab: () => <></>,
    separatorThickness: 0,
    windowToolbarHeight: 0,
};

export const LaymanContext =
    createContext<LaymanContextType>(defaultContextValue);

type LaymanProviderProps = {
    initialLayout: LaymanLayout;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    children: React.ReactNode;
};

export const LaymanProvider = ({
    initialLayout,
    renderPane,
    renderTab,
    children,
}: LaymanProviderProps) => {
    const [layout, setLayout] = useState<LaymanLayout>(initialLayout);
    const [globalTabs, setGlobalTabs] = useState<LaymanTabs>([]);
    const [laymanRef, setLaymanRef] =
        useState<React.RefObject<HTMLElement> | null>(null);
    const [separatorThickness, setSeparatorThickness] = useState(0);
    const [windowToolbarHeight, setWindowToolbarHeight] = useState(0);

    // Get all tabs from initial layout
    useEffect(() => {
        const tabs: LaymanTabs = [];

        const traverseLayout = (layout: LaymanLayout) => {
            if (Array.isArray(layout)) {
                layout.forEach((tab) => tabs.push(tab));
            } else {
                traverseLayout(layout!.first);
                traverseLayout(layout!.second);
            }
        };
        traverseLayout(layout);

        setGlobalTabs(tabs);
    }, [layout]);

    // Get separatorWidth and windowToolbarHeight from CSS variables
    useEffect(() => {
        setSeparatorThickness(
            parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue("--separator-thickness")
                    .trim(),
                10
            ) ?? 16
        );
        setWindowToolbarHeight(
            parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue("--toolbar-height")
                    .trim(),
                10
            ) ?? 64
        );
    }, []);

    /** Adds a new window to the layout at the specified path, on the specified placement. */
    const addWindow = (
        direction: LaymanDirection,
        placement: LaymanBranch,
        newWindowTabs: LaymanTabs,
        path: LaymanPath
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
                ? (value: LaymanLayout) => ({
                      direction: direction,
                      first: newWindowTabs,
                      second: value,
                  })
                : (value: LaymanLayout) => ({
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

    /** Adds a new tab at the specified path within the layout. */
    const addTab = (path: LaymanPath, tab: TabData) => {
        // Edge case: One window, layout is just an array
        if (_.isArray(layout)) {
            layout.push(tab);
            console.log("Updated layout:", layout);
            setLayout([...layout]);
            return;
        }
        const layoutTabList: LaymanLayout = _.get(layout, path.join("."), []);
        if (_.isArray(layoutTabList)) {
            layoutTabList.push(tab);
            console.log("Updated layout:", layout);
            setLayout({...layout});
        }
    };

    /** Removes a tab at the specified index and path.
     * If the last tab is removed, it collapses the parent container.
     */
    const removeTab = (
        path: LaymanPath,
        tabs: LaymanTabs,
        index: number,
        currentTabIndex: number,
        setCurrentTabIndex: Dispatch<SetStateAction<number>>
    ) => {
        // Edge case: One window, remove tab directly from layout array
        if (_.isArray(layout)) {
            console.log("Updated layout:", _.without(layout, tabs[index]));
            setLayout(_.without(layout, tabs[index]));
            return;
        }
        // Get the tab list within the layout based on the path
        const layoutTabList: LaymanLayout = _.get(layout, path.join("."), []);

        // If layoutTabList is not an array, return
        if (!Array.isArray(layoutTabList)) return;

        // Reomve tab at specified index
        layoutTabList.splice(index, 1);

        // Check if the tab list is empty
        if (layoutTabList.length === 0) {
            // Get the parent node
            const parentPath = _.dropRight(path);
            const parent: LaymanLayout = _.get(layout, parentPath);

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
            const side: LaymanBranch =
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

        // Remove tab from global tab list
        setGlobalTabs((prevTabs) =>
            prevTabs.filter((tab) => tab.id !== tabs[index].id)
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
                setGlobalTabs,
                addTab,
                removeTab,
                renderPane,
                renderTab,
                separatorThickness,
                windowToolbarHeight,
            }}
        >
            <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </LaymanContext.Provider>
    );
};
