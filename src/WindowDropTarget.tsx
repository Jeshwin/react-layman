import {useDrop} from "react-dnd";
import {TabType, WindowType} from ".";
import {useContext, useEffect, useRef} from "react";
import {LaymanContext} from "./LaymanContext";
import {DragData, Position, WindowAddress} from "./types";
import {isFloatingAddress} from "./utils";

interface WindowDropTargetProps {
    path: WindowAddress;
    position: Position;
    placement: "top" | "left" | "bottom" | "right" | "center";
}

export function WindowDropTarget({path, position, placement}: WindowDropTargetProps) {
    const {globalContainerSize, layoutDispatch, setDropHighlightPosition, maxDepth, showTabs} =
        useContext(LaymanContext);
    const newDropHighlightPosition = useRef<Position>({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });

    // Edge placements create a new split (depth + 1). Block them once the depth
    // limit is reached; floating destinations are always single-pane, so
    // every placement behaves like "center" there and is always allowed.
    const wouldExceedMaxDepth = placement !== "center" && !isFloatingAddress(path) && path.length >= maxDepth;

    const windowToolbarHeight = showTabs
        ? parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64
        : 0;

    const separatorThickness =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;

    useEffect(() => {
        const dropPosition: Position = {
            top: position.top + windowToolbarHeight,
            left: position.left,
            width: position.width - separatorThickness,
            height: position.height - windowToolbarHeight - separatorThickness / 2,
        };

        if (placement === "top") {
            dropPosition.height = dropPosition.height / 2;
        }
        if (placement === "bottom") {
            dropPosition.top += dropPosition.height / 2;
            dropPosition.height = dropPosition.height / 2;
        }
        if (placement === "left") {
            dropPosition.width = dropPosition.width / 2;
        }
        if (placement === "right") {
            dropPosition.left += dropPosition.width / 2;
            dropPosition.width = dropPosition.width / 2;
        }

        // Include total offset of layout
        dropPosition.top += globalContainerSize.top;
        dropPosition.left += globalContainerSize.left;

        newDropHighlightPosition.current = dropPosition;
    }, [
        globalContainerSize.left,
        globalContainerSize.top,
        placement,
        position.height,
        position.left,
        position.top,
        position.width,
        separatorThickness,
        windowToolbarHeight,
    ]);

    const [, drop] = useDrop(() => ({
        accept: [TabType, WindowType],
        // A floating window's whole-window drag uses the dedicated
        // FloatingDockZones instead of the ordinary per-window grid (which
        // tiles the whole canvas and would leave no free space to just
        // reposition the float). Individual tab drags, and whole-window
        // drags whose source is a tiled window, are unaffected.
        canDrop: (item: DragData, monitor) => {
            if (monitor.getItemType() === WindowType && "tabs" in item) {
                return !isFloatingAddress(item.path);
            }
            return true;
        },
        drop: (item: DragData, monitor) => {
            const itemType = monitor.getItemType();

            if (itemType === TabType && "tab" in item) {
                layoutDispatch({
                    type: "moveTab",
                    tab: item.tab,
                    path: item.path ?? [-1],
                    newPath: path,
                    placement: placement,
                });
            } else if (itemType === WindowType && "tabs" in item && !isFloatingAddress(item.path)) {
                layoutDispatch({
                    type: "moveWindow",
                    path: item.path,
                    newPath: path,
                    window: {
                        tabs: item.tabs,
                        selectedIndex: item.selectedIndex,
                    },
                    placement: placement,
                });
            }
        },
        hover: (_item, monitor) => {
            if (!monitor.canDrop()) return;
            setDropHighlightPosition(newDropHighlightPosition.current);
        },
    }));

    // Don't render a drop zone for edge placements past the depth limit.
    if (wouldExceedMaxDepth) return null;

    return <div ref={drop} className={`layman-window-drop-target ${placement}`}></div>;
}
