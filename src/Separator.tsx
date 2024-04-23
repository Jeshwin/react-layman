import {MouseEventHandler, useEffect, useState} from "react";
import {useAtom, useAtomValue} from "jotai";
import _ from "lodash";
import {windowToolbarHeight, separatorThickness} from "./constants";
import {Inset} from "./Inset";
import {layoutAtom, nexusRefAtom} from "./Nexus";
import {NexusDirection, NexusPath} from "./types";

export default function Separator({
    parentInset,
    splitPercentage,
    direction,
    path,
}: {
    parentInset: Inset;
    splitPercentage: number;
    direction: NexusDirection;
    path: NexusPath;
}) {
    // Access global state using atoms
    const [layout, setLayout] = useAtom(layoutAtom);
    const nexusRef = useAtomValue(nexusRefAtom);
    // State for when user is dragging the separator
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Get name of hover cursor based on direction
    const cursorName = direction === "column" ? "ns-resize" : "ew-resize";

    // Calculate separator inset using parentInset
    const newInset =
        direction === "column"
            ? new Inset({
                  top:
                      ((100 - parentInset.top - parentInset.bottom) *
                          splitPercentage) /
                          100 +
                      parentInset.top,
                  right: parentInset.right,
                  bottom:
                      100 -
                      (((100 - parentInset.top - parentInset.bottom) *
                          splitPercentage) /
                          100 +
                          parentInset.top),
                  left: parentInset.left,
              })
            : new Inset({
                  top: parentInset.top,
                  right:
                      100 -
                      (((100 - parentInset.right - parentInset.left) *
                          splitPercentage) /
                          100 +
                          parentInset.left),
                  bottom: parentInset.bottom,
                  left:
                      ((100 - parentInset.right - parentInset.left) *
                          splitPercentage) /
                          100 +
                      parentInset.left,
              });

    // Calculate minimum panel size to prevent toolbars from being cut off
    const minPanelSize = nexusRef!.current
        ? (100 * (windowToolbarHeight + separatorThickness)) /
          nexusRef!.current.getBoundingClientRect().height
        : 5;

    // Add event listeners to let separator change layout when dragged
    useEffect(() => {
        const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
            event.preventDefault();
            if (isDragging && nexusRef!.current) {
                const parentBBox = nexusRef!.current.getBoundingClientRect();
                let absolutesSplitPercentage;
                if (direction === "column") {
                    absolutesSplitPercentage =
                        ((event.clientY - parentBBox.top) / parentBBox.height) *
                        100.0;
                } else {
                    absolutesSplitPercentage =
                        ((event.clientX - parentBBox.left) / parentBBox.width) *
                        100.0;
                }
                const relativeSplitPercentage =
                    parentInset.relativeSplitPercentage(
                        absolutesSplitPercentage,
                        direction
                    );
                const newSplitPercentage = Math.min(
                    Math.max(relativeSplitPercentage, minPanelSize),
                    100 - minPanelSize
                );
                // Edge case: first separator has no path
                if (path.length == 0) {
                    setLayout({
                        ...layout,
                        splitPercentage: newSplitPercentage,
                    });
                    return;
                }
                let currentLayout = _.get(layout, path.join("."));
                if (Array.isArray(currentLayout)) return;
                currentLayout.splitPercentage = newSplitPercentage;
                setLayout({...layout});
            }
        };

        // Add event listeners to document
        document.addEventListener(
            "mousemove",
            handleMouseMove as unknown as (
                this: Document,
                ev: MouseEvent
            ) => never
        );
        document.addEventListener(
            "mouseup",
            handleMouseUp as unknown as (
                this: Document,
                ev: MouseEvent
            ) => never
        );

        // Clean up event listeners when component unmounts
        return () => {
            document.removeEventListener(
                "mousemove",
                handleMouseMove as unknown as (
                    this: Document,
                    ev: MouseEvent
                ) => never
            );
            document.removeEventListener(
                "mouseup",
                handleMouseUp as unknown as (
                    this: Document,
                    ev: MouseEvent
                ) => never
            );
        };
    }, [
        direction,
        isDragging,
        layout,
        minPanelSize,
        nexusRef,
        parentInset,
        path,
        setLayout,
    ]);

    // Toggle isDragging when holding separator
    const handleMouseUp: MouseEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        setIsHovering(true);
    };

    const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        setIsHovering(true);
    };

    return (
        <div
            style={{
                inset: newInset.toString(),
                position: "absolute",
                height: direction === "column" ? separatorThickness : "auto",
                width: direction === "row" ? separatorThickness : "auto",
                display: "grid",
                placeContent: "center",
                marginTop: `${
                    direction === "column" ? separatorThickness / -2 : 0
                }px`,
                marginLeft: `${
                    direction === "row" ? separatorThickness / -2 : 0
                }px`,
                cursor: isHovering ? cursorName : "auto",
                overflow: "hidden",
                zIndex: 10,
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                style={{
                    borderRadius: 9999,
                    backgroundColor: "#FFFFFF",
                    height: direction === "column" ? 2 : 24,
                    width: direction === "row" ? 2 : 24,
                }}
            ></div>
        </div>
    );
}
