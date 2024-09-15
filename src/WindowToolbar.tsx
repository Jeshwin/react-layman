import {useContext, useEffect} from "react";
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
    const {layoutDispatch} = useContext(LaymanContext);

    // If none of the tabs are selected, set the first tab to be selected
    useEffect(() => {
        let selectedTabExists = false;
        tabs.forEach((tab) => {
            if (tab.isSelected) {
                selectedTabExists = true;
            }
        });
        if (!selectedTabExists) {
            layoutDispatch({
                type: "selectTab",
                path: path,
                tab: tabs[0],
            });
        }
    }, [layoutDispatch, path, tabs]);

    const addBlankTab = () => {
        layoutDispatch({
            type: "addTab",
            path: path,
            tab: new TabData("blank"),
        });
    };

    const removeTabAtIndex = (index: number) => {
        // Deleted tab left of selected tab
        if (tabs[index].isSelected) {
            tabs[Math.max(0, index - 1)].isSelected = true;
        }

        layoutDispatch({
            type: "removeTab",
            path: path,
            tab: tabs[index],
        });
    };

    const handleClickTab = (index: number) => {
        layoutDispatch({
            type: "selectTab",
            path: path,
            tab: tabs[index],
        });
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
                    if (tab.isSelected) {
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
                        layoutDispatch({
                            type: "addWindow",
                            path: path,
                            tab: new TabData("blank"),
                            direction: "column",
                            placement: "second",
                        })
                    }
                />
                <ToolbarButton
                    icon={<VscSplitHorizontal color="white" />}
                    onClick={() =>
                        layoutDispatch({
                            type: "addWindow",
                            path: path,
                            tab: new TabData("blank"),
                            direction: "row",
                            placement: "second",
                        })
                    }
                />
            </div>
        </div>
    );
}
