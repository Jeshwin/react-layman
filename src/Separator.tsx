import {MouseEventHandler, useContext, useEffect, useState} from "react";
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
    const {layout, layoutDispatch, laymanRef} = useContext(LaymanContext);
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

    const minSplitPercentage = 20;
    const maxSplitPercentage = 100 - minSplitPercentage;

    // Add event listeners to let separator change layout when dragged
    useEffect(() => {
        const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
            event.preventDefault();
            if (!isDragging || !laymanRef!.current) return;
            const parentBBox = laymanRef!.current.getBoundingClientRect();
            const absoluteSplitPercentage =
                direction === "column"
                    ? ((event.clientY - parentBBox.top) / parentBBox.height) *
                      100.0
                    : ((event.clientX - parentBBox.left) / parentBBox.width) *
                      100.0;
            const relativeSplitPercentage = parentInset.relativeSplitPercentage(
                absoluteSplitPercentage,
                direction
            );
            const newSplitPercentage = Math.min(
                Math.max(relativeSplitPercentage, minSplitPercentage),
                maxSplitPercentage
            );
            layoutDispatch({
                type: "moveSeparator",
                path: path,
                newSplitPercentage: newSplitPercentage,
            });
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
        parentInset,
        path,
        laymanRef,
        layout,
        layoutDispatch,
        minSplitPercentage,
        maxSplitPercentage,
    ]);

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
