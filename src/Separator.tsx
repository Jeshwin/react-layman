import {MouseEventHandler, useContext, useEffect, useState} from "react";
import _ from "lodash";
import {windowToolbarHeight, separatorThickness} from "./constants";
import {Inset} from "./Inset";
import {LaymanDirection, LaymanPath} from "./types";
import {LaymanContext} from "./LaymanContext";

export function Separator({
    parentInset,
    splitPercentage,
    direction,
    path,
}: {
    parentInset: Inset;
    splitPercentage: number;
    direction: LaymanDirection;
    path: LaymanPath;
}) {
    const laymanContext = useContext(LaymanContext);
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
    const minPanelSize = laymanContext!.laymanRef
        ? (100 * (windowToolbarHeight + separatorThickness)) /
          laymanContext!.laymanRef!.current!.getBoundingClientRect().height
        : 5;

    // Add event listeners to let separator change layout when dragged
    useEffect(() => {
        const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
            event.preventDefault();
            if (isDragging && laymanContext!.laymanRef!.current) {
                const parentBBox =
                    laymanContext!.laymanRef!.current.getBoundingClientRect();
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
                    laymanContext!.setLayout({
                        ...laymanContext!.layout,
                        splitPercentage: newSplitPercentage,
                    });
                    return;
                }
                const currentLayout = _.get(
                    laymanContext!.layout,
                    path.join(".")
                );
                if (Array.isArray(currentLayout)) return;
                currentLayout.splitPercentage = newSplitPercentage;
                laymanContext!.setLayout({...laymanContext!.layout});
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
    }, [direction, isDragging, minPanelSize, parentInset, path, laymanContext]);

    // Toggle isDragging when holding separator
    const handleMouseUp: MouseEventHandler<HTMLElement> = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleMouseDown: MouseEventHandler<HTMLElement> = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    return (
        <div
            style={{
                inset: newInset.toString(),
            }}
            className={`layman-separator ${
                direction === "column"
                    ? "layman-col-separator"
                    : "layman-row-separator"
            }`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div></div>
        </div>
    );
}
