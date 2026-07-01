import {useContext} from "react";
import {useDragLayer, useDrop} from "react-dnd";
import {WindowType} from ".";
import {LaymanContext} from "./LaymanContext";
import {findWindowRectAtPoint} from "./layoutGeometry";
import {DragData, LaymanPath, Position} from "./types";
import {isFloatingAddress} from "./utils";
import {BottomSplitIcon, LeftSplitIcon, RightSplitIcon, TopSplitIcon, UnfloatIcon} from "./Icons";

const EDGE_LONG = 200;
const EDGE_SHORT = 100;
const CENTER_ZONE_MAX = 200;

type Edge = "top" | "bottom" | "left" | "right";

const EDGE_ICONS: Record<Edge, () => JSX.Element> = {
    top: TopSplitIcon,
    bottom: BottomSplitIcon,
    left: LeftSplitIcon,
    right: RightSplitIcon,
};

/** Computes the container-relative rect for one of the 4 fixed edge zones. */
function edgeZoneRect(edge: Edge, container: {width: number; height: number}): Position {
    const inset =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--anchor-inset").trim(), 10) || 16;
    switch (edge) {
        case "top":
            return {top: inset, left: (container.width - EDGE_LONG) / 2, width: EDGE_LONG, height: EDGE_SHORT};
        case "bottom":
            return {
                top: container.height - EDGE_SHORT - inset,
                left: (container.width - EDGE_LONG) / 2,
                width: EDGE_LONG,
                height: EDGE_SHORT,
            };
        case "left":
            return {top: (container.height - EDGE_LONG) / 2, left: inset, width: EDGE_SHORT, height: EDGE_LONG};
        case "right":
            return {
                top: (container.height - EDGE_LONG) / 2,
                left: container.width - EDGE_SHORT - inset,
                width: EDGE_SHORT,
                height: EDGE_LONG,
            };
    }
}

/** One of the 4 fixed edge zones: docks the dragged floating window at the
 *  root of the layout, on that edge (splitting the root only if it isn't
 *  already a matching-direction split - see `treeAddWindow`). */
function FloatingEdgeZone({edge, container}: {edge: Edge; container: {width: number; height: number}}) {
    const {layoutDispatch} = useContext(LaymanContext);
    const [{isOver}, drop] = useDrop<DragData, void, {isOver: boolean}>(() => ({
        accept: [WindowType],
        canDrop: (item) => "tabs" in item && isFloatingAddress(item.path),
        drop: (item) => {
            if (!("tabs" in item)) return;
            layoutDispatch({
                type: "moveWindow",
                path: item.path,
                newPath: [],
                window: {tabs: item.tabs, selectedIndex: item.selectedIndex},
                placement: edge,
            });
        },
        collect: (monitor) => ({isOver: monitor.isOver()}),
    }));
    const Icon = EDGE_ICONS[edge];
    return (
        <div
            ref={drop}
            className={`layman-floating-anchor ${edge} ${isOver ? "over" : ""}`}
            style={{position: "absolute", ...edgeZoneRect(edge, container)}}
        >
            <Icon />
        </div>
    );
}

/** The 5th, dynamic zone: appears centered over whichever tiled window the
 *  cursor is currently over, and merges the dragged floating window's tabs
 *  into it. */
function FloatingCenterZone({path, position}: {path: LaymanPath; position: Position}) {
    const {layoutDispatch} = useContext(LaymanContext);
    const [{isOver}, drop] = useDrop<DragData, void, {isOver: boolean}>(
        () => ({
            accept: [WindowType],
            canDrop: (item) => "tabs" in item && isFloatingAddress(item.path),
            drop: (item) => {
                if (!("tabs" in item)) return;
                layoutDispatch({
                    type: "moveWindow",
                    path: item.path,
                    newPath: path,
                    window: {tabs: item.tabs, selectedIndex: item.selectedIndex},
                    placement: "center",
                });
            },
            collect: (monitor) => ({isOver: monitor.isOver()}),
        }),
        [path]
    );
    const size = {
        width: Math.min(CENTER_ZONE_MAX, position.width),
        height: Math.min(CENTER_ZONE_MAX, position.height),
    };
    const rect: Position = {
        top: position.top + (position.height - size.height) / 2,
        left: position.left + (position.width - size.width) / 2,
        ...size,
    };
    return (
        <div ref={drop} className={`layman-floating-anchor center ${isOver ? "over" : ""}`} style={{position: "absolute", ...rect}}>
            <UnfloatIcon />
        </div>
    );
}

/**
 * Renders the 5 floating-window dock zones - the 4 root edges plus the
 * dynamic "hovered tiled window" center zone - but only while a floating
 * window's whole-window drag is in progress. Detection is derived entirely
 * from the react-dnd monitor (no extra context state needed): a `WindowType`
 * item is currently being dragged whose source address is a floating
 * window's.
 *
 * Mounted once in `Layman.tsx`, inside `.layman-root`, so positions here are
 * container-relative like every other in-root component.
 */
export function FloatingDockZones() {
    const {layout, globalContainerSize, maxDepth} = useContext(LaymanContext);

    const {isDraggingFloat, clientOffset} = useDragLayer((monitor) => {
        const itemType = monitor.getItemType();
        const item = monitor.getItem() as DragData | null;
        const isDraggingFloat =
            monitor.isDragging() && itemType === WindowType && !!item && "tabs" in item && isFloatingAddress(item.path);
        return {
            isDraggingFloat,
            clientOffset: monitor.getClientOffset(),
        };
    });

    if (!isDraggingFloat) return null;

    const point = clientOffset
        ? {x: clientOffset.x - globalContainerSize.left, y: clientOffset.y - globalContainerSize.top}
        : null;
    const hovered = point && layout ? findWindowRectAtPoint(layout, globalContainerSize, point) : null;

    return (
        <>
            {maxDepth > 0 && (
                <>
                    <FloatingEdgeZone edge="top" container={globalContainerSize} />
                    <FloatingEdgeZone edge="bottom" container={globalContainerSize} />
                    <FloatingEdgeZone edge="left" container={globalContainerSize} />
                    <FloatingEdgeZone edge="right" container={globalContainerSize} />
                </>
            )}
            {hovered && <FloatingCenterZone path={hovered.path} position={hovered.position} />}
        </>
    );
}
