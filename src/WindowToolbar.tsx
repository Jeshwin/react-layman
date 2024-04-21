import {useEffect, useState} from "react";
import {useAtom, useAtomValue} from "jotai";
import {
    VscAdd,
    VscClose,
    VscSplitHorizontal,
    VscSplitVertical,
} from "react-icons/vsc";
import {separatorThickness} from "./constants";
import {layoutAtom, renderTabAtom, selectedTabsAtom, tabsAtom} from "./Nexus";
import {
    NexusBranch,
    NexusDirection,
    NexusKey,
    NexusKeys,
    NexusLayout,
    NexusPath,
} from "./types";
import {Inset} from "./Inset";
import _ from "lodash";

export default function WindowToolbar({
    path,
    inset,
    tabs,
}: {
    path: NexusPath;
    inset: Inset;
    tabs: NexusKeys;
}) {
    const [layout, setLayout] = useAtom(layoutAtom);
    const [selectedTabs, setSelectedTabs] = useAtom(selectedTabsAtom);
    const globalTabs = useAtomValue(tabsAtom);
    const renderTab = useAtomValue(renderTabAtom).fn;
    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    // Set current tab to first already selected tab
    useEffect(() => {
        for (let i = 0; i < tabs.length; i++) {
            for (const selectedTab of selectedTabs) {
                if (tabs[i] === selectedTab) {
                    setCurrentTabIndex(i);
                    break;
                }
            }
        }
    }, [tabs, selectedTabs]);

    // Add currently selected tab to selected tab list if not already there
    useEffect(() => {
        setSelectedTabs((prevSelectedTabs: NexusKeys) =>
            prevSelectedTabs.includes(tabs[currentTabIndex])
                ? prevSelectedTabs
                : [...prevSelectedTabs, tabs[currentTabIndex]]
        );
    }, [currentTabIndex, selectedTabs, setSelectedTabs, tabs]);

    //Adds a new window to the layout at the specified path, on the specified placement.
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

    const createUniqueTabId = (tabId: string) => {
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

    const addBlankTab = () => {
        addTab(path, createUniqueTabId("blank"));
    };

    // Removes a tab at the specified index and path. If the last tab is removed, it collapses the parent container.
    const removeTab = (index: number) => {
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
    };

    const removeTabAtIndex = (index: number) => {
        removeTab(index);

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

    const handleClickTab = (index: number) => {
        // Remove previously selected tab from selected tabs
        setSelectedTabs((prevSelectedTabIds: NexusKeys) =>
            prevSelectedTabIds.filter((tab) => tab !== tabs[currentTabIndex])
        );
        setCurrentTabIndex(index);
    };

    const SelectedTab = ({tab, index}: {tab: NexusKey; index: number}) => {
        return (
            <div className="first:rounded-tl w-fit relative flex  items-center bg-zinc-800">
                {/** Add selection border at top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-orange-500"></div>
                <button className="p-2 text-sm">{renderTab(tab)}</button>
                <button
                    className="h-8 w-6 hover:bg-red-500 hover:bg-opacity-50 grid place-content-center"
                    onClick={() => removeTabAtIndex(index)}
                >
                    <VscClose />
                </button>
            </div>
        );
    };

    const NormalTab = ({tab, index}: {tab: NexusKey; index: number}) => {
        return (
            <div className="first:rounded-tl w-fit flex items-center bg-zinc-900 hover:brightness-150">
                <button
                    className="p-2 text-sm"
                    onClick={() => handleClickTab(index)}
                >
                    {renderTab(tab)}
                </button>
                <button
                    className="h-8 w-6 opacity-0 hover:opacity-100 grid place-content-center"
                    onClick={() => removeTabAtIndex(index)}
                >
                    <VscClose />
                </button>
            </div>
        );
    };

    return (
        <div
            id={path.join(":")}
            style={{
                inset: inset.toString(),
                position: "absolute",
                margin: `${separatorThickness / 2}px`,
                marginBottom: 0,
            }}
            className="h-8 z-10 rounded-t bg-zinc-900 flex"
        >
            {/** Render each tab */}
            <div className="flex rounded-tl overflow-x-scroll overflow-y-clip">
                {tabs.map((tab: NexusKey, index: number) => {
                    if (index == currentTabIndex) {
                        return (
                            <SelectedTab key={index} tab={tab} index={index} />
                        );
                    } else {
                        return (
                            <NormalTab key={index} tab={tab} index={index} />
                        );
                    }
                })}
            </div>
            {/** Button to add a new blank menu */}
            <button
                className="h-8 w-8 hover:bg-zinc-800 grid place-content-center"
                onClick={() => addBlankTab()}
            >
                <VscAdd />
            </button>
            {/** Draggable area to move window */}
            <div draggable className="flex-1 min-w-4 cursor-grab"></div>
            {/** Buttons to add convert window to a row or column */}
            <button
                className="w-8 h-8 hover:bg-zinc-800 grid place-content-center"
                onClick={() =>
                    addWindow(
                        "column",
                        "second",
                        [createUniqueTabId("blank")],
                        path
                    )
                }
            >
                <VscSplitVertical />
            </button>
            <button
                className="w-8 h-8 rounded-tr hover:bg-zinc-800 grid place-content-center"
                onClick={() =>
                    addWindow(
                        "row",
                        "second",
                        [createUniqueTabId("blank")],
                        path
                    )
                }
            >
                <VscSplitHorizontal />
            </button>
        </div>
    );
}
