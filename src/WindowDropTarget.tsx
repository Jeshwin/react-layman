import {useDrop} from "react-dnd";
import {DragData, LaymanPath, Position, TabType, WindowType} from "./types";
import {useContext, useEffect, useRef} from "react";
import {LaymanContext} from "./LaymanContext";

interface WindowDropTargetProps {
    path: LaymanPath;
    position: Position;
    placement: "top" | "left" | "bottom" | "right" | "center";
}

export function WindowDropTarget({
    path,
    position,
    placement,
}: WindowDropTargetProps) {
    const {layoutDispatch, setDropHighlightPosition} =
        useContext(LaymanContext);
    const newDropHighlightPosition = useRef<Position>({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });

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
        const dropPosition: Position = {
            top: position.top + windowToolbarHeight,
            left: position.left,
            width: position.width - separatorThickness,
            height:
                position.height - windowToolbarHeight - separatorThickness / 2,
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

        dropPosition.top += separatorThickness;
        dropPosition.left += separatorThickness;

        newDropHighlightPosition.current = dropPosition;
    }, [position, windowToolbarHeight, separatorThickness, placement]);

    const [, drop] = useDrop(() => ({
        accept: [TabType, WindowType],
        drop: (item: DragData, monitor) => {
            const itemType = monitor.getItemType();

            if (itemType === TabType && "tab" in item) {
                // Handle TabType case
                layoutDispatch({
                    type: "moveTab",
                    tab: item.tab,
                    path: item.path,
                    newPath: path,
                    placement: placement,
                });
            } else if (itemType === WindowType && "tabs" in item) {
                // Handle WindowType case
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
        hover: () => setDropHighlightPosition(newDropHighlightPosition.current),
    }));

    return (
        <div
            ref={drop}
            className={`layman-window-drop-target ${placement}`}
        ></div>
    );
}
