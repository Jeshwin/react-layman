import {useContext, useEffect, useMemo, useRef} from "react";
import {WindowToolbar} from "./WindowToolbar";
import {Window} from "./Window";
import {LaymanLayout, LaymanPath, ToolBarProps, WindowProps, Position, SeparatorProps} from "./types";
import {LaymanContext} from "./LaymanContext";
import {Separator} from "./Separator";
import {addressKey} from "./utils";
import {FloatingResizeHandleLayer} from "./FloatingWindow";
import {FloatingDockZones} from "./FloatingDockZones";

/**
 * Entry point for Layman Window Manager
 */
export function Layman() {
    const {globalContainerSize, setGlobalContainerSize, layout, renderNull, draggedWindowTabs, floatingWindows} =
        useContext(LaymanContext);
    // Reference for parent div
    const laymanRef = useRef<HTMLDivElement | null>(null);

    // Keep the shared container size in context up to date on window resize,
    // since layout math throughout Layman is expressed in absolute pixels
    // derived from this size rather than percentages.
    useEffect(() => {
        const updateContainerSize = () => {
            if (laymanRef.current) {
                const {top, left, width, height} = laymanRef.current.getBoundingClientRect();
                setGlobalContainerSize({top, left, width, height});
            }
        };

        updateContainerSize();
        window.addEventListener("resize", updateContainerSize);

        return () => {
            window.removeEventListener("resize", updateContainerSize);
        };
    }, [setGlobalContainerSize]);

    // Window resize alone doesn't catch every case (e.g. the container growing
    // because a flex/grid parent changed), so a ResizeObserver watches the
    // element directly as a second, more reliable source of size updates.
    useEffect(() => {
        if (!laymanRef.current) return;
        const laymanContainer = laymanRef.current;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const {top, left, width, height} = entry.target.getBoundingClientRect();
                setGlobalContainerSize({top, left, width, height});
            }
        });

        resizeObserver.observe(laymanContainer);

        return () => {
            resizeObserver.disconnect();
        };
    }, [globalContainerSize, laymanRef, setGlobalContainerSize]);

    // Derive component lists from layout
    const {toolbars, windows, separators} = useMemo(() => {
        const calculatedToolbars: ToolBarProps[] = [];
        const calculatedWindows: WindowProps[] = [];
        const calculatedSeparators: SeparatorProps[] = [];

        function traverseLayout(layout: LaymanLayout, position: Position, path: LaymanPath) {
            if (!layout) return;

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
                return;
            }

            // It's a layout split, traverse further
            const {direction, children} = layout;

            // Converts a viewPercent into an absolute pixel size along the
            // split's axis. Shared by every pass below, since they all lay
            // children out along the same axis of the same container.
            const pixelsForViewPercent = (viewPercent: number) =>
                direction === "row" ? position.width * (viewPercent / 100) : position.height * (viewPercent / 100);

            // Positions a child at `accumulatedPixels` along the split's axis,
            // filling the full cross-axis of the container. Shared by every
            // pass below for the same reason as pixelsForViewPercent.
            const childPositionAt = (accumulatedPixels: number, sizePixels: number): Position =>
                direction === "row"
                    ? {
                          top: position.top,
                          left: position.left + accumulatedPixels,
                          width: sizePixels,
                          height: position.height,
                      }
                    : {
                          top: position.top + accumulatedPixels,
                          left: position.left,
                          width: position.width,
                          height: sizePixels,
                      };

            // Pushes a separator between this split's children. `childIndex` is
            // the index of the child immediately after the separator (used to
            // build its path), while `separatorIndex` and `separatorPosition`
            // vary between passes below (see their call sites).
            const addSeparator = (childIndex: number, separatorIndex: number, separatorPosition: Position) => {
                calculatedSeparators.push({
                    nodePosition: position,
                    position: separatorPosition,
                    index: separatorIndex,
                    direction,
                    path: path.concat([childIndex]),
                });
            };

            // Check if this split contains the dragged window
            const containsDraggedWindow =
                draggedWindowTabs.length > 0 &&
                children.some((child) => child && "tabs" in child && child.tabs == draggedWindowTabs);

            if (!containsDraggedWindow) {
                // Accumulate pixel offsets for children positioning
                let accumulatedPixels = 0;

                children.forEach((child, index) => {
                    if (!child) return;

                    const viewPercent = child.viewPercent ?? 100 / children.length;
                    const splitPixels = pixelsForViewPercent(viewPercent);
                    const childPosition = childPositionAt(accumulatedPixels, splitPixels);

                    // Traverse deeper into the layout tree
                    traverseLayout(child, childPosition, path.concat([index]));

                    if (index != 0) {
                        addSeparator(index, index - 1, {...childPosition, width: position.width, height: position.height});
                    }

                    // Update accumulated pixel offset for the next child
                    accumulatedPixels += splitPixels;
                });
                return;
            }

            // A window is being dragged out of this split. It's temporarily
            // excluded so the remaining siblings can be rescaled and rendered
            // as if it wasn't there (pass 1), then it's rendered again in a
            // second pass (pass 2) positioned at its original slot, so its
            // drag preview stays visually anchored to where it came from.
            const draggedWindow = children.find((child) => child && "tabs" in child && child.tabs == draggedWindowTabs);
            const draggedWindowSplitPercentage = draggedWindow ? draggedWindow.viewPercent : undefined;

            // Pass 1: render non-dragged tabs as if the dragged tab wasn't there.
            let accumulatedPixels = 0;
            children.forEach((child, index) => {
                if (!child) return;
                // Skip over the dragged tab entirely; it's rendered separately in pass 2.
                if ("tabs" in child && child.tabs == draggedWindowTabs) return;

                // The dragged child's percentage is temporarily excluded from the
                // layout, so the remaining siblings must be rescaled to still add
                // up to 100%. If the dragged window had a known split percentage,
                // divide by the remaining share (100 - that percentage); otherwise
                // assume every child was sharing space equally and divide by the
                // new, smaller child count instead.
                const viewPercent = draggedWindowSplitPercentage
                    ? ((child.viewPercent ? child.viewPercent : 100 / children.length) * 100) /
                      (100 - draggedWindowSplitPercentage)
                    : ((child.viewPercent ? child.viewPercent : 100 / children.length) * children.length) /
                      (children.length - 1);
                const splitPixels = pixelsForViewPercent(viewPercent);
                const childPosition = childPositionAt(accumulatedPixels, splitPixels);

                traverseLayout(child, childPosition, path.concat([index]));

                // Separators aren't interactive during a drag preview, so their
                // position is left zeroed out rather than computed for real.
                if (index != children.length - 1) {
                    addSeparator(index, index, {top: 0, left: 0, width: 0, height: 0});
                }

                accumulatedPixels += splitPixels;
            });

            // Pass 2: render the dragged window again in its original slot, so
            // its drag preview stays where the layout expects it while dragging.
            accumulatedPixels = 0;
            children.forEach((child, index) => {
                if (!child) return;

                const viewPercent = child.viewPercent ?? 100 / children.length;
                const splitPixels = pixelsForViewPercent(viewPercent);
                const childPosition = childPositionAt(accumulatedPixels, splitPixels);

                // Only the dragged window is rendered in this pass; its siblings
                // were already rendered in pass 1.
                if ("tabs" in child && child.tabs == draggedWindowTabs) {
                    traverseLayout(child, childPosition, path.concat([index]));

                    if (index != children.length - 1) {
                        addSeparator(index, index, {top: 0, left: 0, width: 0, height: 0});
                    }
                }

                accumulatedPixels += splitPixels;
            });
        }

        // Initial traversal call with the root layout
        traverseLayout(
            layout,
            {
                top: 0,
                left: 0,
                width: globalContainerSize.width,
                height: globalContainerSize.height,
            },
            []
        );

        // Floating windows aren't part of the split tree, but are addressed,
        // rendered, and dragged-and-dropped identically to tiled windows -
        // append them to the exact same flat lists.
        floatingWindows.forEach((floatingWindow) => {
            calculatedToolbars.push({
                path: {floatingId: floatingWindow.id},
                position: floatingWindow.position,
                tabs: floatingWindow.tabs,
                selectedIndex: floatingWindow.selectedIndex,
                zIndex: floatingWindow.zIndex,
            });
            floatingWindow.tabs.forEach((tab, index) => {
                calculatedWindows.push({
                    position: floatingWindow.position,
                    path: {floatingId: floatingWindow.id},
                    tab,
                    isSelected: index == floatingWindow.selectedIndex,
                    zIndex: floatingWindow.zIndex,
                });
            });
        });

        return {
            toolbars: calculatedToolbars,
            windows: calculatedWindows,
            separators: calculatedSeparators,
        };
    }, [globalContainerSize, draggedWindowTabs, layout, floatingWindows]);

    return (
        <div ref={laymanRef} className="layman-root">
            {/* Shown behind any floating windows when the tree is empty. */}
            {!layout && renderNull}
            {toolbars.map((props) => (
                <WindowToolbar key={addressKey(props.path)} {...props} />
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
            {/* Resize handles for floating windows (their toolbar/pane render
                via the flat lists above, identically to tiled windows). */}
            <FloatingResizeHandleLayer />
            {/* Dock zones for floating-window whole-window drags (edges of
                the root + the tiled window under the cursor); renders
                nothing unless such a drag is in progress. */}
            <FloatingDockZones />
        </div>
    );
}
