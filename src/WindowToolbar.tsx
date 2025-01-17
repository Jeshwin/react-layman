import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {
    VscAdd,
    VscClose,
    VscEllipsis,
    VscLayoutPanel,
    VscLayoutSidebarLeft,
    VscLayoutSidebarRight,
} from "react-icons/vsc";
import {WindowType} from ".";
import {SingleTab, Tab} from "./WindowTabs";
import {ToolbarButton} from "./ToolbarButton";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {WindowDropTarget} from "./WindowDropTarget";
import {useDrag, useDragLayer} from "react-dnd";
import {Position, ToolbarButtonType, ToolBarProps} from "./types";
import {LuMaximize, LuMinimize} from "react-icons/lu";

function usePrevious(value: number) {
    const ref = useRef(0);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function WindowToolbar({path, position, tabs, selectedIndex}: ToolBarProps) {
    const {
        layoutDispatch,
        globalDragging,
        setGlobalDragging,
        setWindowDragStartPosition,
        setDraggedWindowTabs,
        mutable,
        toolbarButtons,
    } = useContext(LaymanContext);
    const tabContainerRef = useRef<HTMLDivElement>(null);
    // Track the previous length of the tabs array
    const previousTabCount = usePrevious(tabs.length);
    const windowToolbarHeight =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64;
    const separatorThickness =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;
    // 1x1 transparent image for empty drag preview
    const emptyImage = useMemo(() => {
        const img = new Image();
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent GIF
        return img;
    }, []);

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
    const [{isDragging}, drag, dragPreview] = useDrag({
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
    const [{singleTabIsDragging}, singleTabDrag, singleTabDragPreview] = useDrag({
        type: WindowType,
        item: {path, tabs, selectedIndex},
        collect: (monitor) => ({
            singleTabIsDragging: monitor.isDragging(),
        }),
        end: () => {
            setDraggedWindowTabs([]);
            setWindowDragStartPosition({x: 0, y: 0});
        },
    });

    // Hide default drag previews
    useEffect(() => {
        dragPreview(emptyImage);
    }, [dragPreview, emptyImage]);

    useEffect(() => {
        singleTabDragPreview(emptyImage);
    }, [singleTabDragPreview, emptyImage]);

    // Custom drag layer to track mouse position during dragging
    const {clientOffset} = useDragLayer((monitor) => ({
        clientOffset: monitor.getClientOffset(),
    }));

    useEffect(() => {
        if (clientOffset && (isDragging || singleTabIsDragging)) {
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
    }, [clientOffset, dragStartPosition.x, dragStartPosition.y, isDragging, singleTabIsDragging]);

    useEffect(() => {
        setGlobalDragging(isDragging || singleTabIsDragging);
    }, [isDragging, setGlobalDragging, singleTabIsDragging]);

    useEffect(() => {
        if (isDragging || singleTabIsDragging) {
            setDraggedWindowTabs(tabs);
            setWindowDragStartPosition(dragStartPosition);
        }
    }, [dragStartPosition, isDragging, setDraggedWindowTabs, setWindowDragStartPosition, singleTabIsDragging, tabs]);

    const scale = isDragging || singleTabIsDragging ? 0.7 : 1;

    const windowToolbarPosition: Position = {
        top: position.top + currentMousePosition.top,
        left: position.left * scale + currentMousePosition.left,
        width: position.width - separatorThickness,
        height: windowToolbarHeight,
    };

    const dropTargetsPosition: Position = {
        top: position.top + windowToolbarHeight,
        left: position.left,
        width: position.width - separatorThickness,
        height: position.height - windowToolbarHeight - separatorThickness / 2,
    };

    const createToolbarButton = (child: ToolbarButtonType, index: number) => {
        switch (child) {
            case "splitTop":
                return (
                    <ToolbarButton
                        key={index}
                        onClick={() =>
                            layoutDispatch({
                                type: "addWindow",
                                path: path,
                                window: {
                                    tabs: [new TabData("blank")],
                                    selectedIndex: 0,
                                },
                                placement: "top",
                            })
                        }
                    >
                        <VscLayoutPanel style={{transform: "rotate(180deg)"}} />
                    </ToolbarButton>
                );
            case "splitBottom":
                return (
                    <ToolbarButton
                        key={index}
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
                    >
                        <VscLayoutPanel />
                    </ToolbarButton>
                );
            case "splitLeft":
                return (
                    <ToolbarButton
                        key={index}
                        onClick={() =>
                            layoutDispatch({
                                type: "addWindow",
                                path: path,
                                window: {
                                    tabs: [new TabData("blank")],
                                    selectedIndex: 0,
                                },
                                placement: "left",
                            })
                        }
                    >
                        <VscLayoutSidebarLeft />
                    </ToolbarButton>
                );
            case "splitRight":
                return (
                    <ToolbarButton
                        key={index}
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
                    >
                        <VscLayoutSidebarRight />
                    </ToolbarButton>
                );
            case "maximize":
                return (
                    <ToolbarButton key={index} onClick={() => {}}>
                        <LuMaximize />
                    </ToolbarButton>
                );
            case "minimize":
                return (
                    <ToolbarButton key={index} onClick={() => {}}>
                        <LuMinimize />
                    </ToolbarButton>
                );
            case "close":
                return (
                    <ToolbarButton
                        key={index}
                        onClick={() => {
                            layoutDispatch({
                                type: "removeWindow",
                                path: path,
                            });
                        }}
                    >
                        <VscClose />
                    </ToolbarButton>
                );
            case "misc":
                return (
                    <ToolbarButton key={index} onClick={() => {}}>
                        <VscEllipsis />
                    </ToolbarButton>
                );
        }
    };

    return (
        <>
            <div
                id={path.join(":")}
                style={{
                    ...windowToolbarPosition,
                    transform: `scale(${scale})`,
                    transformOrigin: `${dragStartPosition.x}px bottom`,
                    zIndex: isDragging || singleTabIsDragging ? 13 : 7,
                    pointerEvents: isDragging || singleTabIsDragging ? "none" : "auto",
                    userSelect: isDragging || singleTabIsDragging ? "none" : "auto",
                }}
                className="layman-toolbar"
            >
                {/** Render each tab */}
                <div ref={tabContainerRef} className="tab-container">
                    {tabs.length > 1 ? (
                        tabs.map((tab: TabData, index: number) => {
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
                        })
                    ) : (
                        <SingleTab
                            dragRef={singleTabDrag}
                            tab={tabs[0]}
                            onDelete={() =>
                                layoutDispatch({
                                    type: "removeTab",
                                    path: path,
                                    tab: tabs[0],
                                })
                            }
                            onMouseDown={(event) => {
                                setDragStartPosition({
                                    x: event.clientX,
                                    y: event.clientY,
                                });
                                layoutDispatch({
                                    type: "selectTab",
                                    path: path,
                                    tab: tabs[0],
                                });
                            }}
                        />
                    )}
                </div>
                {/** Button to add a new blank menu */}
                <div style={{display: "flex"}}>
                    <ToolbarButton
                        onClick={() =>
                            layoutDispatch({
                                type: "addTab",
                                path: path,
                                tab: new TabData("blank"),
                            })
                        }
                    >
                        <VscAdd />
                    </ToolbarButton>
                </div>
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
                    {mutable
                        ? toolbarButtons?.map((child, index) => createToolbarButton(child, index))
                        : (["maximize", "minimize", "misc"] as Array<ToolbarButtonType>).map((child, index) =>
                              createToolbarButton(child, index)
                          )}
                </div>
            </div>
            {!(isDragging || singleTabIsDragging) && (
                <div
                    style={{
                        position: "absolute",
                        ...dropTargetsPosition,
                        zIndex: 10,
                        margin: "calc(var(--separator-thickness, 8px) / 2)",
                        marginTop: 0,
                        pointerEvents: globalDragging ? "auto" : "none",
                    }}
                >
                    <WindowDropTarget path={path} position={position} placement="top" />
                    <WindowDropTarget path={path} position={position} placement="bottom" />
                    <WindowDropTarget path={path} position={position} placement="left" />
                    <WindowDropTarget path={path} position={position} placement="right" />
                    <WindowDropTarget path={path} position={position} placement="center" />
                </div>
            )}
        </>
    );
}
