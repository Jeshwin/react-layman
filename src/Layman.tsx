import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {WindowToolbar} from "./WindowToolbar";
import {Window} from "./Window";
// import {Separator} from "./Separator";
import {
    LaymanLayout,
    LaymanPath,
    // SeparatorProps,
    ToolBarProps,
    PaneProps,
    Position,
} from "./types";
import {LaymanContext} from "./LaymanContext";

// Entry point for Layman Window Manager
// Takes in an initial layout as a multi-node tree object
// See types.ts for specs
export function Layman() {
    const {setLaymanRef, layout} = useContext(LaymanContext);
    // Local state for component lists
    // const [separators, setSeparators] = useState<SeparatorProps[]>([]);
    const [toolbars, setToolbars] = useState<ToolBarProps[]>([]);
    const [panes, setPanes] = useState<PaneProps[]>([]);
    // Reference for parent div
    const laymanRef = useRef<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        setLaymanRef(laymanRef);

        // Get the dimensions of the Layman container when the component mounts
        if (laymanRef.current) {
            const {width, height} = laymanRef.current.getBoundingClientRect();
            setContainerSize({width, height});
        }
    }, [setLaymanRef]);

    // Calculate component lists whenever layout changes
    // useMemo caches values if they don't change
    useMemo(() => {
        // const calculatedSeparators: SeparatorProps[] = [];
        const calculatedToolbars: ToolBarProps[] = [];
        const calculatedPanes: PaneProps[] = [];

        function traverseLayout(
            layout: LaymanLayout,
            position: Position,
            path: LaymanPath
        ) {
            // Check if it's a window (LaymanWindow) or a layout split
            if ("tabs" in layout) {
                // If it's a window, handle the tabs and panes
                calculatedToolbars.push({
                    position,
                    path,
                    tabs: layout.tabs,
                });

                layout.tabs.forEach((tab) => {
                    calculatedPanes.push({
                        position,
                        tab,
                    });
                });
            } else {
                // It's a layout split (row/column) - handle separators and traverse further
                const {direction, children} = layout;

                // Accumulate pixel offsets for children positioning
                let accumulatedPixels = 0;

                children.forEach((child, index) => {
                    const viewPercent =
                        child.viewPercent ?? 100 / children.length;

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

                    // if (index < children.length - 1) {
                    //     // Add separator between children (but not after the last child)
                    //     calculatedSeparators.push({
                    //         parentPosition: position,
                    //         splitPercentage: viewPercent,
                    //         direction,
                    //         path: path.concat([index]),
                    //     });
                    // }

                    // Traverse deeper into the layout tree
                    traverseLayout(child, childPosition, path.concat([index]));

                    // Update accumulated pixel offset for the next child
                    accumulatedPixels += splitPixels;
                });
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
        // setSeparators(calculatedSeparators);
        setToolbars(calculatedToolbars);
        setPanes(calculatedPanes);
    }, [containerSize, layout]);

    return (
        <div ref={laymanRef} className="layman-root">
            {/* {separators.map((props) => (
                <Separator
                    key={props.path.length != 0 ? props.path.join(":") : "root"}
                    parentPosition={props.parentPosition}
                    splitPercentage={props.splitPercentage}
                    direction={props.direction}
                    path={props.path}
                />
            ))} */}
            {toolbars.map((props) => (
                <WindowToolbar
                    key={props.path.length != 0 ? props.path.join(":") : "root"}
                    position={props.position}
                    path={props.path}
                    tabs={props.tabs}
                />
            ))}
            {panes.map((props) => (
                <Window
                    key={props.tab.id}
                    position={props.position}
                    tab={props.tab}
                />
            ))}
        </div>
    );
}
