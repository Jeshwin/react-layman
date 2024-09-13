import {useContext, useEffect, useState} from "react";
import {VscAdd, VscSplitHorizontal, VscSplitVertical} from "react-icons/vsc";
import {LaymanTabs, LaymanPath} from "./types";
import {Inset} from "./Inset";
import {NormalTab, SelectedTab} from "./WindowTabs";
import {ToolbarButton} from "./ToolbarButton";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";

export function WindowToolbar({
    path,
    inset,
    tabs,
}: {
    path: LaymanPath;
    inset: Inset;
    tabs: LaymanTabs;
}) {
    const {setGlobalTabs, addTab, removeTab, addWindow} =
        useContext(LaymanContext);
    const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);

    // Add currently selected tab to selected tab list if not already there
    useEffect(() => {
        setGlobalTabs((prevTabs) =>
            prevTabs.map((tab) => {
                if (tab.id === tabs[currentTabIndex].id) {
                    // Update the isSelected property directly
                    tab.isSelected = true;
                }
                return tab;
            })
        );
    }, [currentTabIndex, setGlobalTabs, tabs]);

    const addBlankTab = () => {
        addTab(path, new TabData("blank"));
    };

    const removeTabAtIndex = (index: number) => {
        removeTab(path, tabs, index, currentTabIndex, setCurrentTabIndex);
    };

    const handleClickTab = (index: number) => {
        // Remove previously selected tab from selected tabs
        setGlobalTabs((prevTabs) =>
            prevTabs.map((tab) => {
                if (tab.id === tabs[currentTabIndex].id) {
                    // Update the isSelected property directly
                    tab.isSelected = false;
                }
                return tab;
            })
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
                {tabs.map((tab: TabData, index: number) => {
                    if (index == currentTabIndex) {
                        return (
                            <SelectedTab
                                key={index}
                                tab={tab}
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
                        addWindow(
                            "column",
                            "second",
                            [new TabData("blank")],
                            path
                        )
                    }
                />
                <ToolbarButton
                    icon={<VscSplitHorizontal color="white" />}
                    onClick={() =>
                        addWindow("row", "second", [new TabData("blank")], path)
                    }
                />
            </div>
        </div>
    );
}
