import {describe, it, expect} from "vitest";
import {computeWindowRects, findWindowAtPoint, findWindowRectAtPoint} from "../src/layoutGeometry";
import {TabData} from "../src/TabData";
import {LaymanNode} from "../src/types";

/** A two-child row split of two single-tab windows, 40/60 split. */
function makeRowOfTwo(): LaymanNode {
    return {
        direction: "row",
        children: [
            {tabs: [new TabData("Left")], selectedIndex: 0, viewPercent: 40},
            {tabs: [new TabData("Right")], selectedIndex: 0, viewPercent: 60},
        ],
    };
}

const container = {width: 1000, height: 500};

describe("computeWindowRects", () => {
    it("computes pixel rects for every leaf, proportional to viewPercent", () => {
        const rects = computeWindowRects(makeRowOfTwo(), container);

        expect(rects).toHaveLength(2);
        expect(rects[0]).toEqual({path: [0], position: {top: 0, left: 0, width: 400, height: 500}});
        expect(rects[1]).toEqual({path: [1], position: {top: 0, left: 400, width: 600, height: 500}});
    });

    it("returns an empty array for an undefined layout", () => {
        expect(computeWindowRects(undefined, container)).toEqual([]);
    });
});

describe("findWindowRectAtPoint", () => {
    it("returns the path and rect of the leaf containing the point", () => {
        const layout = makeRowOfTwo();

        expect(findWindowRectAtPoint(layout, container, {x: 100, y: 250})).toEqual({
            path: [0],
            position: {top: 0, left: 0, width: 400, height: 500},
        });
        expect(findWindowRectAtPoint(layout, container, {x: 900, y: 250})).toEqual({
            path: [1],
            position: {top: 0, left: 400, width: 600, height: 500},
        });
    });

    it("returns null when the layout is undefined", () => {
        expect(findWindowRectAtPoint(undefined, container, {x: 100, y: 100})).toBeNull();
    });

    it("returns null when the point is outside every leaf's rect", () => {
        const layout = makeRowOfTwo();
        expect(findWindowRectAtPoint(layout, container, {x: -50, y: 250})).toBeNull();
        expect(findWindowRectAtPoint(layout, container, {x: 100, y: 9999})).toBeNull();
    });

    it("picks the last (deepest/rightmost) match on boundary ties", () => {
        const layout = makeRowOfTwo();
        // x=400 is exactly the shared boundary; both rects technically
        // contain it ([0,400] and [400,1000]) - the later entry wins.
        expect(findWindowRectAtPoint(layout, container, {x: 400, y: 250})).toEqual({
            path: [1],
            position: {top: 0, left: 400, width: 600, height: 500},
        });
    });
});

describe("findWindowAtPoint", () => {
    it("returns just the path, matching findWindowRectAtPoint", () => {
        const layout = makeRowOfTwo();
        expect(findWindowAtPoint(layout, container, {x: 100, y: 250})).toEqual([0]);
        expect(findWindowAtPoint(layout, container, {x: 900, y: 250})).toEqual([1]);
    });

    it("returns null when nothing matches", () => {
        expect(findWindowAtPoint(undefined, container, {x: 0, y: 0})).toBeNull();
    });
});
