import {useContext, useEffect, useRef, useState} from "react";
import {VscAdd, VscSplitHorizontal, VscSplitVertical} from "react-icons/vsc";
import {ToolBarProps, WindowType} from "./types";
import {Tab} from "./WindowTabs";
import {ToolbarButton} from "./ToolbarButton";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {WindowDropTarget} from "./WindowDropTarget";
import _ from "lodash";
import {useDrag, useDragLayer} from "react-dnd";

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
    const {
        layoutDispatch,
        setIsDragging,
        setWindowDragStartPosition,
        setDraggedWindowTabs,
    } = useContext(LaymanContext);
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

    // Setting up drag for moving windows using react-dnd
    const [currentMousePosition, setCurrentMousePosition] = useState({
        top: position.top,
        left: position.left,
    });
    const [dragStartPosition, setDragStartPosition] = useState({x: 0, y: 0});
    const [{isDragging}, drag] = useDrag({
        type: WindowType,
        item: {path, tabs, selectedIndex},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            setDraggedWindowTabs([]);
            setWindowDragStartPosition({x: 0, y: 0});
        },
    });

    // Custom drag layer to track mouse position during dragging
    const {clientOffset} = useDragLayer((monitor) => ({
        clientOffset: monitor.getClientOffset(),
    }));

    useEffect(() => {
        if (clientOffset && isDragging) {
            setCurrentMousePosition({
                top: clientOffset.y - dragStartPosition.y,
                left: clientOffset.x - dragStartPosition.x,
            });
        } else {
            setCurrentMousePosition({
                top: 0,
                left: 0,
            });
        }
    }, [clientOffset, dragStartPosition, isDragging, position]);

    useEffect(() => {
        setIsDragging(isDragging);
    }, [isDragging, setIsDragging]);

    useEffect(() => {
        if (isDragging) {
            setDraggedWindowTabs(tabs);
            setWindowDragStartPosition(dragStartPosition);
        }
    }, [
        dragStartPosition,
        isDragging,
        setDraggedWindowTabs,
        setWindowDragStartPosition,
        tabs,
    ]);

    const scale = isDragging ? 0.7 : 1;

    return (
        <>
            <div
                id={path.join(":")}
                style={{
                    top: position.top + currentMousePosition.top,
                    left: position.left * scale + currentMousePosition.left,
                    width: position.width - separatorThickness,
                    height: windowToolbarHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: `${dragStartPosition.x}px top`,
                    zIndex: isDragging ? 13 : "auto",
                    pointerEvents: isDragging ? "none" : "auto",
                    userSelect: isDragging ? "none" : "auto",
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
                                onDelete={() =>
                                    layoutDispatch({
                                        type: "removeTab",
                                        path: path,
                                        tab: tabs[index],
                                    })
                                }
                                onMouseDown={() =>
                                    layoutDispatch({
                                        type: "selectTab",
                                        path: path,
                                        tab: tabs[index],
                                    })
                                }
                            />
                        );
                    })}
                </div>
                {/** Button to add a new blank menu */}
                <ToolbarButton
                    icon={<VscAdd />}
                    onClick={() =>
                        layoutDispatch({
                            type: "addTab",
                            path: path,
                            tab: new TabData("blank"),
                        })
                    }
                />
                {/** Draggable area to move window */}
                <div
                    ref={drag}
                    className="drag-area"
                    onMouseDown={(event) => {
                        setDragStartPosition({
                            x: event.clientX,
                            y: event.clientY,
                        });
                    }}
                ></div>
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
            {!isDragging && (
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
            )}
        </>
    );
}
