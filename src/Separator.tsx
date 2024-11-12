/* eslint-disable @typescript-eslint/no-unused-vars */
import {MouseEventHandler, useCallback, useContext, useEffect, useState} from "react";
import {SeparatorProps} from "./types";
import {LaymanContext} from "./LaymanContext";
import _ from "lodash";

export function Separator({nodePosition, position, index, direction, path, separators}: SeparatorProps) {
    const {layoutDispatch, laymanRef} = useContext(LaymanContext);
    const [isDragging, setIsDragging] = useState(false);

    const separatorThickness =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;
    const toolbarHeight =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 32;

    // Find the previous separator
    const previousSeparator = separators!.find((sep) => {
        const prevPath = [...path];
        prevPath[prevPath.length - 1] -= 1;
        return _.isEqual(sep.path, prevPath);
    })?.position;

    // Find the next separator
    const nextSeparator = separators!.find((sep) => {
        const prevPath = [...path];
        prevPath[prevPath.length - 1] += 1;
        return _.isEqual(sep.path, prevPath);
    })?.position;

    // Toggle isDragging when holding separator
    const handleMouseUp: MouseEventHandler<HTMLElement> = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleMouseDown: MouseEventHandler<HTMLElement> = useCallback((event) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    // Add event listeners to let separator change layout when dragged
    useEffect(() => {
        const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
            event.preventDefault();
            if (!isDragging || !laymanRef!.current) return;
            let splitPercentage =
                direction === "column"
                    ? 100 *
                      ((event.clientY - (previousSeparator ? previousSeparator.top : nodePosition.top)) /
                          nodePosition.height)
                    : 100 *
                      ((event.clientX - (previousSeparator ? previousSeparator.left : nodePosition.left)) /
                          nodePosition.width);
            const minSplitPercentage =
                (100 * (toolbarHeight + separatorThickness)) /
                (direction === "column" ? nodePosition.height : nodePosition.width);
            const maxSplitPercentage =
                (direction === "column"
                    ? 100 *
                      (((nextSeparator ? nextSeparator.top : nodePosition.top + nodePosition.height) -
                          (previousSeparator ? previousSeparator.top : nodePosition.top)) /
                          nodePosition.height)
                    : 100 *
                      (((nextSeparator ? nextSeparator.left : nodePosition.left + nodePosition.width) -
                          (previousSeparator ? previousSeparator.left : nodePosition.left)) /
                          nodePosition.width)) - minSplitPercentage;
            splitPercentage = _.clamp(splitPercentage, minSplitPercentage, maxSplitPercentage);
            const basePath = [...path];
            basePath.pop();
            layoutDispatch({
                type: "moveSeparator",
                path: basePath,
                index,
                newSplitPercentage: splitPercentage,
            });
        };

        // Add event listeners to document
        document.addEventListener("mousemove", handleMouseMove as unknown as (this: Document, ev: MouseEvent) => never);
        document.addEventListener("mouseup", handleMouseUp as unknown as (this: Document, ev: MouseEvent) => never);

        // Clean up event listeners when component unmounts
        return () => {
            document.removeEventListener(
                "mousemove",
                handleMouseMove as unknown as (this: Document, ev: MouseEvent) => never
            );
            document.removeEventListener(
                "mouseup",
                handleMouseUp as unknown as (this: Document, ev: MouseEvent) => never
            );
        };
    }, [
        direction,
        index,
        isDragging,
        laymanRef,
        layoutDispatch,
        nextSeparator,
        nodePosition,
        path,
        previousSeparator,
        separatorThickness,
        toolbarHeight,
    ]);

    return (
        <div
            style={{
                top: position.top,
                left: position.left,
                width: direction === "column" ? position.width : separatorThickness,
                height: direction === "row" ? position.height : separatorThickness,
            }}
            className={`layman-separator ${direction === "column" ? "layman-col-separator" : "layman-row-separator"}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div></div>
        </div>
    );
}
