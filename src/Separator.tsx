import {MouseEventHandler, useEffect, useState} from "react";
import {useAtom, useAtomValue} from "jotai";
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
                const layoutClone = structuredClone(layout);
                let currentLayout = layoutClone;
                for (const index of path) {
                    if (Array.isArray(currentLayout)) {
                        break;
                    }
                    if (index === "first") {
                        currentLayout = currentLayout.first;
                    } else {
                        currentLayout = currentLayout.second;
                    }
                }
                if (Array.isArray(currentLayout)) return;
                currentLayout.splitPercentage = Math.min(
                    Math.max(relativeSplitPercentage, minPanelSize),
                    100 - minPanelSize
                );
                setLayout(layoutClone);
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
        parentInset,
        layout,
        direction,
        splitPercentage,
        isDragging,
        setLayout,
        path,
        minPanelSize,
        nexusRef,
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

    return (
        <div
            style={{
                inset: newInset.toString(),
                position: "absolute",
                marginTop: `${
                    direction === "column" ? separatorThickness / -2 : 0
                }px`,
                marginLeft: `${
                    direction === "row" ? separatorThickness / -2 : 0
                }px`,
            }}
            className={`${direction === "column" ? "h-2" : "w-2"} ${
                direction === "column"
                    ? "hover:cursor-ns-resize"
                    : "hover:cursor-ew-resize"
            } z-10 grid place-content-center overflow-hidden`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div
                className={`${direction === "column" ? "h-0.5" : "w-0.5"} ${
                    direction === "column" ? "w-6" : "h-6"
                } rounded-full bg-zinc-50`}
            ></div>
        </div>
    );
}
