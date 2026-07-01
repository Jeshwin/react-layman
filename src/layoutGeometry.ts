import {LaymanLayout, LaymanPath, Position} from "./types";

/**
 * Walks a layout tree and returns the computed pixel rectangle of every leaf
 * window, paired with its path. Mirrors the (non-dragging) positioning logic in
 * Layman's `traverseLayout`. Used for hit-testing where a floating window should
 * be dropped when it is un-floated.
 */
export function computeWindowRects(
    layout: LaymanLayout,
    container: {width: number; height: number}
): Array<{path: LaymanPath; position: Position}> {
    const result: Array<{path: LaymanPath; position: Position}> = [];

    function walk(node: LaymanLayout, position: Position, path: LaymanPath) {
        if (!node) return;
        if ("tabs" in node) {
            result.push({path, position});
            return;
        }
        const {direction, children} = node;
        let accumulated = 0;
        children.forEach((child, index) => {
            if (!child) return;
            const viewPercent = child.viewPercent ?? 100 / children.length;
            const splitPixels =
                direction === "row" ? position.width * (viewPercent / 100) : position.height * (viewPercent / 100);
            const childPosition: Position =
                direction === "row"
                    ? {top: position.top, left: position.left + accumulated, width: splitPixels, height: position.height}
                    : {top: position.top + accumulated, left: position.left, width: position.width, height: splitPixels};
            walk(child, childPosition, path.concat([index]));
            accumulated += splitPixels;
        });
    }

    walk(layout, {top: 0, left: 0, width: container.width, height: container.height}, []);
    return result;
}

/**
 * Returns the path and pixel rectangle of the leaf window containing the
 * given point, or null if none do. Used both for un-float hit-testing and to
 * size/center the "hovered tiled window" floating dock zone.
 */
export function findWindowRectAtPoint(
    layout: LaymanLayout,
    container: {width: number; height: number},
    point: {x: number; y: number}
): {path: LaymanPath; position: Position} | null {
    const rects = computeWindowRects(layout, container);
    // Iterate in reverse so deeper/later windows win ties.
    for (let i = rects.length - 1; i >= 0; i--) {
        const rect = rects[i];
        const {position} = rect;
        if (
            point.x >= position.left &&
            point.x <= position.left + position.width &&
            point.y >= position.top &&
            point.y <= position.top + position.height
        ) {
            return rect;
        }
    }
    return null;
}

/**
 * Returns the path of the leaf window whose rectangle contains the given point,
 * or null if none do.
 */
export function findWindowAtPoint(
    layout: LaymanLayout,
    container: {width: number; height: number},
    point: {x: number; y: number}
): LaymanPath | null {
    return findWindowRectAtPoint(layout, container, point)?.path ?? null;
}
