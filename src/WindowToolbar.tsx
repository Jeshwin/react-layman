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

    //Adds a new window to the layout at the specified path, on the specified placement.
    const addWindow = (
        direction: NexusDirection,
        placement: NexusBranch,
        newWindowTabs: NexusKeys,
        path: NexusPath
    ) => {
        // Navigate to the parent of the target window
        const parentPath = path.slice(0, -1);
        let target: NexusLayout = layout;
        for (const index of parentPath) {
            if (Array.isArray(target)) {
                break;
            }
            if (index === "first") {
                target = target.first;
            } else {
                target = target.second;
            }
        }

        // Identify the target window within its parent
        const targetWindowKey: NexusBranch = path[path.length - 1];
        const originalWindow: NexusLayout = !Array.isArray(target)
            ? target[targetWindowKey]
            : [];

        // Create a new division at this level
        const newDivision: NexusLayout = {
            direction: direction,
            first: placement === "first" ? newWindowTabs : originalWindow,
            second: placement === "second" ? newWindowTabs : originalWindow,
        };

        // Replace the original window with the new division
        if (!Array.isArray(target)) {
            target[targetWindowKey] = newDivision;
        }

        // Update the layout in the state
        console.log("Layout updated with new window:", layout);
        setLayout({...layout});
    };

    /**
     * Adds a new tab at the specified path within the layout.
     * @param {Array} path - Path to the tab list within the layout where the new tab should be added.
     * @param {string} tabName - Name of the new tab to add.
     */
    const addTab = (path: NexusPath, tab: NexusKey) => {
        let layoutTabList: NexusLayout = layout;
        for (const index of path) {
            if (Array.isArray(layoutTabList)) {
                break;
            }
            if (index === "first") {
                layoutTabList = layoutTabList.first;
            } else {
                layoutTabList = layoutTabList.second;
            }
        }
        if (Array.isArray(layoutTabList)) {
            layoutTabList.push(tab);
        }
        console.log("Updated layout:", layout);
        setLayout({...layout});
    };

    /**
     * Removes a tab at the specified index and path. If the last tab is removed, it collapses the parent container.
     * @param {Array} path - Path to the tab list within the layout where the tab should be removed.
     * @param {number} index - Index of the tab to be removed.
     */
    const removeTab = (path: NexusPath, index: number) => {
        let layoutTabList: NexusLayout = layout;
        for (const index of path) {
            if (Array.isArray(layoutTabList)) {
                break;
            }
            if (index === "first") {
                layoutTabList = layoutTabList.first;
            } else {
                layoutTabList = layoutTabList.second;
            }
        }

        if (!Array.isArray(layoutTabList)) return;

        layoutTabList.splice(index, 1); // Reomve tab and index
        if (layoutTabList.length === 0) {
            // Navigate to the parent node
            const parentPath = path.slice(0, -1);
            let parent: NexusLayout = layout;
            for (const idx of parentPath) {
                if (Array.isArray(parent)) {
                    break;
                }
                if (idx === "first") {
                    parent = parent.first;
                } else {
                    parent = parent.second;
                }
            }

            if (Array.isArray(parent)) return;

            // Determine which side this node was on and its sibling
            const side = path[path.length - 1];
            const sibling = side === "first" ? parent.second : parent.first;

            // Replace the parent node with the sibling node
            if (parentPath.length > 0) {
                const grandParentPath = parentPath.slice(0, -1);
                let grandParent: NexusLayout = layout;
                for (const idx of grandParentPath) {
                    if (Array.isArray(grandParent)) {
                        break;
                    }
                    if (idx === "first") {
                        grandParent = grandParent.first;
                    } else {
                        grandParent = grandParent.second;
                    }
                }
                const parentSide = parentPath[parentPath.length - 1];
                if (Array.isArray(grandParent)) return;
                grandParent[parentSide] = sibling;
            } else {
                // We're at the top level of layout
                console.log("Updated layout:", sibling);
                setLayout({...sibling});
                return;
            }
        }

        console.log("Updated layout:", layout);
        setLayout({...layout});
    };

    const createUniqueTabId = (tabId: string) => {
        let count = 0;
        for (const existingTab of globalTabs) {
            if (existingTab.split(":")[0] === tabId) count++;
        }
        return `${tabId}:${count}`;
    };

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

    useEffect(() => {
        setSelectedTabs((prevSelectedTabIds: NexusKeys) => [
            ...prevSelectedTabIds,
            tabs[currentTabIndex],
        ]);
    }, [currentTabIndex, setSelectedTabs, tabs]);

    const addBlankTab = () => {
        addTab(path, createUniqueTabId("blank"));
    };

    const removeTabAtIndex = (index: number) => {
        console.log(`Removing tab #${index} from window ${path.join(":")}`);
        removeTab(path, index);

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
