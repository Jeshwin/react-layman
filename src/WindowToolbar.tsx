import {useContext, useEffect, useRef} from "react";
import {VscAdd, VscSplitHorizontal, VscSplitVertical} from "react-icons/vsc";
import {ToolBarProps} from "./types";
import {Tab} from "./WindowTabs";
import {ToolbarButton} from "./ToolbarButton";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {WindowDropTarget} from "./WindowDropTarget";
import _ from "lodash";

function usePrevious(value: number) {
    const ref = useRef(0);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function WindowToolbar({
    path,
    position,
    tabs,
    selectedIndex,
}: ToolBarProps) {
    const {layoutDispatch} = useContext(LaymanContext);
    const tabContainerRef = useRef<HTMLDivElement>(null);
    // Track the previous length of the tabs array
    const previousTabCount = usePrevious(tabs.length);
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

    // useEffect to handle scrolling when the number of tabs changes
    useEffect(() => {
        // Check if the number of tabs increased
        if (previousTabCount !== undefined && tabs.length > previousTabCount) {
            if (tabContainerRef.current) {
                const tabContainer = tabContainerRef.current;
                // Check if the container is scrollable
                if (tabContainer.scrollWidth > tabContainer.clientWidth) {
                    // Scroll all the way to the right (including the new tab's width)
                    tabContainer.scrollLeft = tabContainer.scrollWidth;
                }
            }
        }
    }, [tabs.length, previousTabCount]); // Run when the length of tabs changes

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
        <>
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
                <div ref={tabContainerRef} className="tab-container">
                    {tabs.map((tab: TabData, index: number) => {
                        return (
                            <Tab
                                key={index}
                                path={path}
                                tab={tab}
                                isSelected={index == selectedIndex}
                                onDelete={() => removeTabAtIndex(index)}
                                onMouseDown={() => handleClickTab(index)}
                            />
                        );
                    })}
                </div>
                {/** Button to add a new blank menu */}
                <ToolbarButton
                    icon={<VscAdd />}
                    onClick={() => addBlankTab()}
                />
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
                                    selectedIndex: 0,
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
                                    selectedIndex: 0,
                                },
                                placement: "right",
                            })
                        }
                    />
                </div>
            </div>
            <div
                style={{
                    position: "absolute",
                    top: position.top + windowToolbarHeight,
                    left: position.left,
                    width: position.width - separatorThickness,
                    height:
                        position.height -
                        windowToolbarHeight -
                        separatorThickness / 2,
                    zIndex: 10,
                    margin: "calc(var(--separator-thickness, 8px) / 2)",
                    marginTop: 0,
                }}
            >
                <WindowDropTarget
                    path={path}
                    position={_.cloneDeep(position)}
                    placement="top"
                />
                <WindowDropTarget
                    path={path}
                    position={_.cloneDeep(position)}
                    placement="bottom"
                />
                <WindowDropTarget
                    path={path}
                    position={_.cloneDeep(position)}
                    placement="left"
                />
                <WindowDropTarget
                    path={path}
                    position={_.cloneDeep(position)}
                    placement="right"
                />
                <WindowDropTarget
                    path={path}
                    position={_.cloneDeep(position)}
                    placement="center"
                />
            </div>
        </>
    );
}
