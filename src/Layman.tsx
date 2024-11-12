import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {WindowToolbar} from "./WindowToolbar";
import {Window} from "./Window";
import {LaymanLayout, LaymanPath, ToolBarProps, WindowProps, Position, SeparatorProps} from "./types";
import {LaymanContext} from "./LaymanContext";
import {Separator} from "./Separator";

/**
 * Entry point for Layman Window Manager
 */
export function Layman() {
    const {setLaymanRef, layout, draggedWindowTabs} = useContext(LaymanContext);
    // Local state for component lists
    const [toolbars, setToolbars] = useState<ToolBarProps[]>([]);
    const [windows, setWindows] = useState<WindowProps[]>([]);
    const [separators, setSeparators] = useState<SeparatorProps[]>([]);
    // Reference for parent div
    const laymanRef = useRef<HTMLDivElement | null>(null);

    // Size of Layman container
    const [containerSize, setContainerSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0,
    });

    // Function to update container size
    const updateContainerSize = () => {
        if (laymanRef.current) {
            const {width, height} = laymanRef.current.getBoundingClientRect();
            setContainerSize({width, height});
        }
    };

    useEffect(() => {
        setLaymanRef(laymanRef);

        // Get the initial dimensions of the container when the component mounts
        updateContainerSize();

        // Add window resize event listener
        window.addEventListener("resize", updateContainerSize);

        // Cleanup resize event listener on unmount
        return () => {
            window.removeEventListener("resize", updateContainerSize);
        };
    }, [setLaymanRef]);

    // Calculate component lists whenever layout changes
    useMemo(() => {
        const calculatedToolbars: ToolBarProps[] = [];
        const calculatedWindows: WindowProps[] = [];
        const calculatedSeparators: SeparatorProps[] = [];

        function traverseLayout(layout: LaymanLayout, position: Position, path: LaymanPath) {
            // Check if it's a window (LaymanWindow) or a layout split
            if ("tabs" in layout) {
                // If it's a window, handle the tabs and panes
                calculatedToolbars.push({
                    path,
                    position,
                    tabs: layout.tabs,
                    selectedIndex: layout.selectedIndex ?? 0,
                });

                layout.tabs.forEach((tab, index) => {
                    calculatedWindows.push({
                        position,
                        path,
                        tab,
                        isSelected: index == layout.selectedIndex,
                    });
                });
            } else {
                // It's a layout split, traverse further
                const {direction, children} = layout;

                // Check if this split contains the dragged window
                const containsDraggedWindow =
                    draggedWindowTabs.length > 0 &&
                    children.some((child) => "tabs" in child && child.tabs == draggedWindowTabs);

                if (!containsDraggedWindow) {
                    // Accumulate pixel offsets for children positioning
                    let accumulatedPixels = 0;

                    children.forEach((child, index) => {
                        const viewPercent = child.viewPercent ?? 100 / children.length;

                        const splitPixels =
                            direction === "row"
                                ? position.width * (viewPercent / 100)
                                : position.height * (viewPercent / 100);

                        // Calculate the new child position based on splitPixels
                        const childPosition =
                            direction === "row"
                                ? {
                                      top: position.top,
                                      left: position.left + accumulatedPixels,
                                      width: splitPixels,
                                      height: position.height,
                                  }
                                : {
                                      top: position.top + accumulatedPixels,
                                      left: position.left,
                                      width: position.width,
                                      height: splitPixels,
                                  };

                        // Traverse deeper into the layout tree
                        traverseLayout(child, childPosition, path.concat([index]));

                        // Add separator
                        if (index != 0)
                            calculatedSeparators.push({
                                nodePosition: position,
                                position: {
                                    ...childPosition,
                                    width: position.width,
                                    height: position.height,
                                },
                                index: index - 1,
                                direction,
                                path: path.concat([index]),
                            });

                        // Update accumulated pixel offset for the next child
                        accumulatedPixels += splitPixels;
                    });
                } else {
                    // Render non-dragged tabs as if dragged tab wasn't there
                    let accumulatedPixels = 0;

                    children.forEach((child, index) => {
                        // Skip over dragged tab
                        if ("tabs" in child && child.tabs == draggedWindowTabs) return;
                        const viewPercent = child.viewPercent
                            ? (child.viewPercent * children.length) / (children.length - 1)
                            : 100 / (children.length - 1);

                        const splitPixels =
                            direction === "row"
                                ? position.width * (viewPercent / 100)
                                : position.height * (viewPercent / 100);

                        // Calculate the new child position based on splitPixels
                        const childPosition =
                            direction === "row"
                                ? {
                                      top: position.top,
                                      left: position.left + accumulatedPixels,
                                      width: splitPixels,
                                      height: position.height,
                                  }
                                : {
                                      top: position.top + accumulatedPixels,
                                      left: position.left,
                                      width: position.width,
                                      height: splitPixels,
                                  };

                        // Traverse deeper into the layout tree
                        traverseLayout(child, childPosition, path.concat([index]));

                        // Add separator

                        if (index != children.length - 1)
                            calculatedSeparators.push({
                                nodePosition: position,
                                position: {
                                    top: 0,
                                    left: 0,
                                    width: 0,
                                    height: 0,
                                },
                                index,
                                direction,
                                path: path.concat([index]),
                            });

                        // Update accumulated pixel offset for the next child
                        accumulatedPixels += splitPixels;
                    });

                    // Render dragged window as if it was still in the layout
                    accumulatedPixels = 0;
                    children.forEach((child, index) => {
                        const viewPercent = child.viewPercent ?? 100 / children.length;

                        const splitPixels =
                            direction === "row"
                                ? position.width * (viewPercent / 100)
                                : position.height * (viewPercent / 100);

                        // Calculate the new child position based on splitPixels
                        const childPosition =
                            direction === "row"
                                ? {
                                      top: position.top,
                                      left: position.left + accumulatedPixels,
                                      width: splitPixels,
                                      height: position.height,
                                  }
                                : {
                                      top: position.top + accumulatedPixels,
                                      left: position.left,
                                      width: position.width,
                                      height: splitPixels,
                                  };

                        // Only traverse dragged window
                        if ("tabs" in child && child.tabs == draggedWindowTabs) {
                            traverseLayout(child, childPosition, path.concat([index]));

                            if (index != children.length - 1)
                                calculatedSeparators.push({
                                    nodePosition: position,
                                    position: {
                                        top: 0,
                                        left: 0,
                                        width: 0,
                                        height: 0,
                                    },
                                    index,
                                    direction,
                                    path: path.concat([index]),
                                });
                        }

                        // Update accumulated pixel offset for the next child
                        accumulatedPixels += splitPixels;
                    });
                }
            }
        }

        // Initial traversal call with the root layout
        traverseLayout(
            layout,
            {
                top: 0,
                left: 0,
                width: containerSize.width,
                height: containerSize.height,
            },
            []
        );

        // Set the calculated arrays
        setToolbars(calculatedToolbars);
        setWindows(calculatedWindows);
        setSeparators(calculatedSeparators);
    }, [containerSize, draggedWindowTabs, layout]);

    return (
        <div ref={laymanRef} className="layman-root">
            {toolbars.map((props) => (
                <WindowToolbar key={props.path.length != 0 ? props.path.join(":") : "root"} {...props} />
            ))}
            {windows.map((props) => (
                <Window key={props.tab.id} {...props} />
            ))}
            {separators.map((props) => (
                <Separator
                    key={props.path.length != 0 ? props.path.join(":") : "root"}
                    separators={separators} // Pass the full list
                    {...props}
                />
            ))}
        </div>
    );
}
