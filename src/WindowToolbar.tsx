import {useContext, useEffect} from "react";
import {VscAdd, VscSplitHorizontal, VscSplitVertical} from "react-icons/vsc";
import {ToolBarProps} from "./types";
import {NormalTab, SelectedTab} from "./WindowTabs";
import {ToolbarButton} from "./ToolbarButton";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";

export function WindowToolbar({
    path,
    position,
    tabs,
    selectedIndex,
}: ToolBarProps) {
    const {layoutDispatch} = useContext(LaymanContext);
    const windowToolbarHeight =
        parseInt(
            getComputedStyle(document.documentElement)
                .getPropertyValue("--toolbar-height")
                .trim(),
            10
        ) ?? 64;
    const separatorThickness =
        parseInt(
            getComputedStyle(document.documentElement)
                .getPropertyValue("--separator-thickness")
                .trim(),
            10
        ) ?? 8;

    useEffect(() => {
        layoutDispatch({
            type: "selectTab",
            path: path,
            tab: tabs[selectedIndex],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addBlankTab = () => {
        layoutDispatch({
            type: "addTab",
            path: path,
            tab: new TabData("blank"),
        });
    };

    const removeTabAtIndex = (index: number) => {
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
                ...position,
                width: position.width - separatorThickness,
                height: windowToolbarHeight,
            }}
            className="layman-toolbar"
        >
            {/** Render each tab */}
            <div className="tab-container">
                {tabs.map((tab: TabData, index: number) => {
                    if (index == selectedIndex) {
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
            <ToolbarButton icon={<VscAdd />} onClick={() => addBlankTab()} />
            {/** Draggable area to move window */}
            <div draggable className="drag-area"></div>
            {/** Buttons to add convert window to a row or column */}
            <div className="toolbar-button-container">
                <ToolbarButton
                    icon={<VscSplitVertical />}
                    onClick={() =>
                        layoutDispatch({
                            type: "addWindow",
                            path: path,
                            window: {
                                tabs: [new TabData("blank")],
                            },
                            placement: "bottom",
                        })
                    }
                />
                <ToolbarButton
                    icon={<VscSplitHorizontal />}
                    onClick={() =>
                        layoutDispatch({
                            type: "addWindow",
                            path: path,
                            window: {
                                tabs: [new TabData("blank")],
                            },
                            placement: "right",
                        })
                    }
                />
            </div>
        </div>
    );
}
