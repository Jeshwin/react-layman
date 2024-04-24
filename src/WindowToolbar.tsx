import {useEffect, useState} from "react";
import {useAtom, useAtomValue} from "jotai";
import {VscAdd, VscSplitHorizontal, VscSplitVertical} from "react-icons/vsc";
import {layoutAtom, selectedTabsAtom, tabsAtom} from "./Nexus";
import {NexusKey, NexusKeys, NexusPath} from "./types";
import {Inset} from "./Inset";
import _ from "lodash";
import {NormalTab, SelectedTab} from "./WindowTabs";
import {addTab, addWindow, createUniqueTabId, removeTab} from "./NexusAPI";
import {ToolbarButton} from "./WindowButton";

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

    const addBlankTab = () => {
        addTab(layout, setLayout, path, createUniqueTabId("blank", globalTabs));
    };

    const removeTabAtIndex = (index: number) => {
        removeTab(
            layout,
            setLayout,
            path,
            tabs,
            index,
            currentTabIndex,
            setCurrentTabIndex,
            setSelectedTabs
        );
    };

    const handleClickTab = (index: number) => {
        // Remove previously selected tab from selected tabs
        setSelectedTabs((prevSelectedTabIds: NexusKeys) =>
            prevSelectedTabIds.filter((tab) => tab !== tabs[currentTabIndex])
        );
        setCurrentTabIndex(index);
    };

    return (
        <div
            id={path.join(":")}
            style={{
                inset: inset.toString(),
            }}
            className="nexus-toolbar"
        >
            {/** Render each tab */}
            <div className="tab-container">
                {tabs.map((tab: NexusKey, index: number) => {
                    if (index == currentTabIndex) {
                        return (
                            <SelectedTab
                                key={index}
                                tab={tab}
                                onClick={() => handleClickTab(index)}
                                onDelete={() => removeTabAtIndex(index)}
                            />
                        );
                    } else {
                        return (
                            <NormalTab
                                key={index}
                                tab={tab}
                                onClick={() => handleClickTab(index)}
                                onDelete={() => removeTabAtIndex(index)}
                            />
                        );
                    }
                })}
            </div>
            {/** Button to add a new blank menu */}
            <ToolbarButton
                icon={<VscAdd color="white" />}
                onClick={() => addBlankTab()}
            />
            {/** Draggable area to move window */}
            <div draggable className="drag-area"></div>
            {/** Buttons to add convert window to a row or column */}
            <ToolbarButton
                icon={<VscSplitVertical color="white" />}
                onClick={() =>
                    addWindow(
                        layout,
                        setLayout,
                        "column",
                        "second",
                        [createUniqueTabId("blank", globalTabs)],
                        path
                    )
                }
            />
            <ToolbarButton
                icon={<VscSplitHorizontal color="white" />}
                onClick={() =>
                    addWindow(
                        layout,
                        setLayout,
                        "row",
                        "second",
                        [createUniqueTabId("blank", globalTabs)],
                        path
                    )
                }
            />
        </div>
    );
}
