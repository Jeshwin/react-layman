import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {WindowType} from ".";
import {SingleTab, Tab} from "./WindowTabs";
import {ToolbarButton} from "./ToolbarButton";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {WindowDropTarget} from "./WindowDropTarget";
import {WindowMenu} from "./WindowMenu";
import {useDrag, useDragLayer} from "react-dnd";
import {Position, ToolbarButtonType, ToolBarProps} from "./types";
import {findWindowAtPoint} from "./layoutGeometry";
import {
    AddIcon,
    BottomSplitIcon,
    CloseIcon,
    EllipsisIcon,
    FloatIcon,
    LeftSplitIcon,
    MaximizeIcon,
    MinimizeIcon,
    RightSplitIcon,
    TopSplitIcon,
    UnfloatIcon,
} from "./Icons";
import {addressKey, deepEqual, isFloatingAddress} from "./utils";

function usePrevious(value: number) {
    const ref = useRef(0);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function WindowToolbar({path, position: rawPosition, tabs, selectedIndex, zIndex: floatingZIndex}: ToolBarProps) {
    const {
        layout,
        layoutDispatch,
        globalContainerSize,
        globalDragging,
        setGlobalDragging,
        setWindowDragStartPosition,
        setDraggedWindowTabs,
        toolbarButtons,
        maximizedPath,
        setMaximizedPath,
        maxDepth,
        showTabs,
    } = useContext(LaymanContext);
    const tabContainerRef = useRef<HTMLDivElement>(null);
    const isFloating = isFloatingAddress(path);
    // A maximized window overrides its layout position to fill the whole container.
    const isMaximized = maximizedPath !== null && deepEqual(maximizedPath, path);
    const position = isMaximized
        ? {top: 0, left: 0, width: globalContainerSize.width, height: globalContainerSize.height}
        : rawPosition;
    // Whether to collapse the controls into an ellipsis popover instead of a full toolbar.
    const [menuOpen, setMenuOpen] = useState(false);
    // Track the previous length of the tabs array
    const previousTabCount = usePrevious(tabs.length);
    const cssToolbarHeight =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64;
    // When the tab row is hidden the toolbar occupies no vertical space.
    const windowToolbarHeight = showTabs ? cssToolbarHeight : 0;
    const separatorThickness =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;
    // Splits create a deeper window (path.length + 1); block them at the limit.
    // Floating windows are always single-pane, so splitting never applies.
    const atMaxDepth = isFloating || path.length >= maxDepth;
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

    // Map vertical wheel scrolling to horizontal scrolling so mouse-only users
    // can scroll through overflowing tabs (issue #12, optional).
    const handleTabContainerWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        const tabContainer = tabContainerRef.current;
        if (!tabContainer) return;
        // Only translate vertical wheel motion when the tabs actually overflow and
        // the gesture is predominantly vertical (trackpads send deltaX directly).
        if (tabContainer.scrollWidth <= tabContainer.clientWidth) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        tabContainer.scrollLeft += event.deltaY;
    };

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
    // When a floating window's whole-window drag ends without landing on a
    // drop target (i.e. it was just repositioned, not docked/merged
    // elsewhere), commit its new pixel position.
    const commitFloatingDragEnd = (monitor: {didDrop: () => boolean}) => {
        if (isFloatingAddress(path) && !monitor.didDrop()) {
            layoutDispatch({
                type: "setFloatingWindowPosition",
                floatingId: path.floatingId,
                position: {
                    top: position.top + currentMousePosition.top,
                    left: position.left + currentMousePosition.left,
                    width: position.width,
                    height: position.height,
                },
            });
        }
    };
    const [{isDragging}, drag, dragPreview] = useDrag({
        type: WindowType,
        item: {path, tabs, selectedIndex},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (_item, monitor) => {
            commitFloatingDragEnd(monitor);
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
        end: (_item, monitor) => {
            commitFloatingDragEnd(monitor);
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

    // Floating windows aren't part of the split tree, so a whole-window drag
    // moves the real window 1:1 instead of showing a shrunken "ghost" preview.
    const scale = (isDragging || singleTabIsDragging) && !isFloating ? 0.7 : 1;

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

    // Move this window out of the layout into a brand-new floating window,
    // keeping its current calculated size/position. Expressed as a single
    // `moveWindow` action so the same tabs/selectedIndex move by reference -
    // nothing is destroyed and recreated, so pane state survives.
    const floatWindow = () => {
        if (isMaximized) setMaximizedPath(null);
        layoutDispatch({
            type: "moveWindow",
            path,
            newPath: {floatingId: crypto.randomUUID()},
            window: {tabs, selectedIndex},
            placement: "center",
            position: {
                top: rawPosition.top,
                left: rawPosition.left,
                width: rawPosition.width,
                height: rawPosition.height,
            },
        });
    };

    // Dock this floating window back into the tree, under whichever tiled
    // window is currently under its center point (or drag it onto a
    // `WindowDropTarget` for the same effect with a precise destination).
    const unfloatWindow = () => {
        if (!isFloatingAddress(path)) return;
        const center = {x: position.left + position.width / 2, y: position.top + position.height / 2};
        let targetPath = findWindowAtPoint(layout, globalContainerSize, center);

        // Fallback: if the center is over nothing but the layout is empty,
        // seed a brand new root window. Otherwise, do nothing (stay floating).
        if (targetPath === null) {
            if (!layout) {
                targetPath = [];
            } else {
                return;
            }
        }

        layoutDispatch({
            type: "moveWindow",
            path,
            newPath: targetPath,
            window: {tabs, selectedIndex},
            placement: "center",
        });
    };

    // Bring this floating window to the front on any interaction with it.
    const bringToFront = () => {
        if (isFloatingAddress(path)) layoutDispatch({type: "bringFloatingWindowToFront", floatingId: path.floatingId});
    };

    const createToolbarButton = (child: ToolbarButtonType, index: number) => {
        // Hide split buttons once the maximum nesting depth is reached.
        if (
            atMaxDepth &&
            (child === "splitTop" || child === "splitBottom" || child === "splitLeft" || child === "splitRight")
        ) {
            return null;
        }
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
                        <TopSplitIcon />
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
                        <BottomSplitIcon />
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
                        <LeftSplitIcon />
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
                        <RightSplitIcon />
                    </ToolbarButton>
                );
            // "maximize" is a toggle: it becomes "minimize" while this window is
            // maximized. "minimize" behaves identically so either type works.
            case "maximize":
            case "minimize":
                return (
                    <ToolbarButton key={index} onClick={() => setMaximizedPath(isMaximized ? null : path)}>
                        {isMaximized ? <MinimizeIcon /> : <MaximizeIcon />}
                    </ToolbarButton>
                );
            // "float" is a toggle: it becomes "unfloat" while this window is
            // already floating. "unfloat" behaves identically so either type works.
            case "float":
            case "unfloat":
                return (
                    <ToolbarButton key={index} onClick={() => (isFloating ? unfloatWindow() : floatWindow())}>
                        {isFloating ? <UnfloatIcon /> : <FloatIcon />}
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
                        <CloseIcon />
                    </ToolbarButton>
                );
            case "misc":
                return (
                    <ToolbarButton key={index} onClick={() => {}}>
                        <EllipsisIcon />
                    </ToolbarButton>
                );
        }
    };

    // The window control buttons (shared by the toolbar and the ellipsis menu).
    const controlButtons = toolbarButtons?.map((child, index) => createToolbarButton(child, index)) ?? [];
    // Always append the "misc" button at the end, but only when the tab row is shown.
    if (showTabs) {
        controlButtons.push(createToolbarButton("misc", controlButtons.length));
    }

    return (
        <>
            {showTabs ? (
                <div
                    id={addressKey(path)}
                    style={{
                        ...windowToolbarPosition,
                        transform: `scale(${scale})`,
                        transformOrigin: `${dragStartPosition.x}px bottom`,
                        zIndex: isMaximized
                            ? 20
                            : isFloating
                              ? isDragging || singleTabIsDragging
                                  ? 999
                                  : (floatingZIndex ?? 30)
                              : isDragging || singleTabIsDragging
                                ? 13
                                : 7,
                        pointerEvents: isDragging || singleTabIsDragging ? "none" : "auto",
                        userSelect: isDragging || singleTabIsDragging ? "none" : "auto",
                    }}
                    className={`layman-toolbar ${isFloating ? "floating" : ""}`}
                    onMouseDown={bringToFront}
                >
                    {/** Render each tab */}
                    <div ref={tabContainerRef} className="tab-container" onWheel={handleTabContainerWheel}>
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
                            onClick={() => {
                                const newTab = new TabData("blank");
                                layoutDispatch({
                                    type: "addTab",
                                    path: path,
                                    tab: newTab,
                                });
                                layoutDispatch({
                                    type: "selectTab",
                                    path: path,
                                    tab: newTab,
                                });
                            }}
                        >
                            <AddIcon />
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
                    <div className="toolbar-button-container">{controlButtons}</div>
                </div>
            ) : (
                <WindowMenu
                    path={path}
                    position={position}
                    tabs={tabs}
                    selectedIndex={selectedIndex}
                    open={menuOpen}
                    setOpen={setMenuOpen}
                    controlButtons={controlButtons}
                />
            )}
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
