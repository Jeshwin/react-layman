import {useContext, useEffect, useState} from "react";
import {VscAdd, VscSplitHorizontal, VscSplitVertical} from "react-icons/vsc";
import {NexusKey, NexusKeys, NexusPath} from "./types";
import {Inset} from "./Inset";
import _ from "lodash";
import {NormalTab, SelectedTab} from "./WindowTabs";
import {ToolbarButton} from "./WindowButton";
import {LaymanContext} from "./LaymanContext";

export default function WindowToolbar({
    path,
    inset,
    tabs,
}: {
    path: NexusPath;
    inset: Inset;
    tabs: NexusKeys;
}) {
    const laymanContext = useContext(LaymanContext);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    // Set current tab to first already selected tab
    useEffect(() => {
        for (let i = 0; i < tabs.length; i++) {
            for (const selectedTab of laymanContext!.selectedTabs) {
                if (tabs[i] === selectedTab) {
                    setCurrentTabIndex(i);
                    break;
                }
            }
        }
    }, [tabs]);

    // Add currently selected tab to selected tab list if not already there
    useEffect(() => {
        laymanContext!.setSelectedTabs((prevSelectedTabs: NexusKeys) =>
            prevSelectedTabs.includes(tabs[currentTabIndex])
                ? prevSelectedTabs
                : [...prevSelectedTabs, tabs[currentTabIndex]]
        );
    }, [currentTabIndex, tabs]);

    const addBlankTab = () => {
        laymanContext!.addTab(path, laymanContext!.createUniqueTabId("blank"));
    };

    const removeTabAtIndex = (index: number) => {
        laymanContext!.removeTab(
            path,
            tabs,
            index,
            currentTabIndex,
            setCurrentTabIndex
        );
    };

    const handleClickTab = (index: number) => {
        // Remove previously selected tab from selected tabs
        laymanContext!.setSelectedTabs((prevSelectedTabIds: NexusKeys) =>
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
                    laymanContext!.addWindow(
                        "column",
                        "second",
                        [laymanContext!.createUniqueTabId("blank")],
                        path
                    )
                }
            />
            <ToolbarButton
                icon={<VscSplitHorizontal color="white" />}
                onClick={() =>
                    laymanContext!.addWindow(
                        "row",
                        "second",
                        [laymanContext!.createUniqueTabId("blank")],
                        path
                    )
                }
            />
        </div>
    );
}
