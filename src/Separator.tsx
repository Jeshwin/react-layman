/* eslint-disable @typescript-eslint/no-unused-vars */
import {MouseEventHandler, useCallback, useContext, useEffect, useState} from "react";
import {SeparatorProps} from "./types";
import {LaymanContext} from "./LaymanContext";
import _ from "lodash";

export function Separator({nodePosition, position, index, direction, path}: SeparatorProps) {
    const {layout, layoutDispatch, laymanRef} = useContext(LaymanContext);
    const [isDragging, setIsDragging] = useState(false);

    const separatorThickness =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;

    // Compute relative split percentage using position of the parent node
    // absoluteSplitPercentage just gets mouse position and dimensions of total layout
    // relative split percentage needs to get the position of only the parent layout
    // Also needs to consider existing split percentages of affected windows? So you can't overflow?
    const calculateRelativeSplitPercentage = (absoluteSplitPercentage: number) => {
        // Determine layout dimensions and scaling based on direction
        const windowStart = direction === "column" ? position.top : position.left;
        const windowSize = direction === "column" ? position.height : position.width;

        // Convert the absolute percentage to an absolute pixel offset within the entire layout
        const absolutePixelOffset = (absoluteSplitPercentage / 100) * windowSize;

        // Calculate relative percentage by scaling absolute pixel offset to the window's size
        const relativeSplitPercentage = (absolutePixelOffset / windowSize) * 100;

        return relativeSplitPercentage;
    };

    // Toggle isDragging when holding separator
    const handleMouseUp: MouseEventHandler<HTMLElement> = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleMouseDown: MouseEventHandler<HTMLElement> = useCallback(
        (event) => {
            event.preventDefault();
            setIsDragging(true);
            console.dir({position, index, direction, path});
        },
        [direction, index, path, position]
    );

    // Add event listeners to let separator change layout when dragged
    useEffect(() => {
        const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
            event.preventDefault();
            if (!isDragging || !laymanRef!.current) return;
            const parentBBox = laymanRef!.current.getBoundingClientRect();
            // const absoluteSplitPercentage =
            //     direction === "column"
            //         ? ((event.clientY - parentBBox.top) / parentBBox.height) * 100.0
            //         : ((event.clientX - parentBBox.left) / parentBBox.width) * 100.0;
            // const relativeSplitPercentage = calculateRelativeSplitPercentage(absoluteSplitPercentage);
            let splitPercentage =
                direction === "column"
                    ? ((event.clientY - nodePosition.top) / nodePosition.height) * 100.0
                    : ((event.clientX - nodePosition.left) / nodePosition.width) * 100.0;
            // Clamp splitPercentage between 5 and 95 for now
            splitPercentage = _.clamp(splitPercentage, 5, 95);

            // layoutDispatch({
            //     type: "moveSeparator",
            //     path: path,
            //     index,
            //     newSplitPercentage: relativeSplitPercentage,
            // });
            layoutDispatch({
                type: "moveSeparator",
                path: path,
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
    }, [direction, isDragging, nodePosition, path, laymanRef, layout, layoutDispatch, index]);

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
