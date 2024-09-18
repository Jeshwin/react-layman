import {useDrop} from "react-dnd";
import {LaymanPath, Position, TabType} from "./types";
import {TabData} from "./TabData";
import {useContext, useEffect} from "react";
import {LaymanContext} from "./LaymanContext";
import _ from "lodash";

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
    const [{isOver}, drop] = useDrop(() => ({
        accept: TabType,
        drop: (item: {tab: TabData; path: LaymanPath}) => {
            layoutDispatch({
                type: "moveTab",
                tab: item.tab,
                path: item.path,
                newPath: path,
                placement: placement,
            });
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({shallow: true}),
        }),
    }));

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
        if (isOver) {
            console.dir({
                path,
                position,
                placement,
            });
            const dropPosition: Position = _.cloneDeep({
                top: position.top + windowToolbarHeight,
                left: position.left,
                width: position.width - separatorThickness,
                height:
                    position.height -
                    windowToolbarHeight -
                    separatorThickness / 2,
            });

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

            setDropHighlightPosition(dropPosition);
        }
    }, [
        isOver,
        path,
        placement,
        position,
        separatorThickness,
        setDropHighlightPosition,
        windowToolbarHeight,
    ]);

    return (
        <div
            ref={drop}
            className={`layman-window-drop-target ${placement}`}
        ></div>
    );
}
