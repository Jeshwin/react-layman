import {useContext, useEffect, useState} from "react";
import {VscAdd, VscSplitHorizontal, VscSplitVertical} from "react-icons/vsc";
import {LaymanKey, LaymanKeys, LaymanPath} from "./types";
import {Inset} from "./Inset";
import {NormalTab, SelectedTab} from "./WindowTabs";
import {ToolbarButton} from "./ToolbarButton";
import {LaymanContext} from "./LaymanContext";

export function WindowToolbar({
    path,
    inset,
    tabs,
}: {
    path: LaymanPath;
    inset: Inset;
    tabs: LaymanKeys;
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
    }, [tabs, laymanContext]);

    // Add currently selected tab to selected tab list if not already there
    useEffect(() => {
        laymanContext!.setSelectedTabs((prevSelectedTabs: LaymanKeys) =>
            prevSelectedTabs.includes(tabs[currentTabIndex])
                ? prevSelectedTabs
                : [...prevSelectedTabs, tabs[currentTabIndex]]
        );
    }, [currentTabIndex, tabs, laymanContext]);

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
        laymanContext!.setSelectedTabs((prevSelectedTabIds: LaymanKeys) =>
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
            className="layman-toolbar"
        >
            {/** Render each tab */}
            <div className="tab-container">
                {tabs.map((tab: LaymanKey, index: number) => {
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
            <div className="toolbar-button-container">
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
        </div>
    );
}
