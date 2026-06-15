import {describe, it, expect} from "vitest";
import {LaymanReducer} from "../src/LaymanReducer";
import {TabData} from "../src/TabData";
import {LaymanNode, LaymanWindow} from "../src/types";

/** A single window holding the given tabs at selectedIndex 0. */
function makeWindow(...tabs: TabData[]): LaymanWindow {
    return {tabs, selectedIndex: 0};
}

/** A two-child row split of two single-tab windows. */
function makeRowOfTwo(left: TabData, right: TabData): LaymanNode {
    return {
        direction: "row",
        children: [
            {tabs: [left], selectedIndex: 0, viewPercent: 50},
            {tabs: [right], selectedIndex: 0, viewPercent: 50},
        ],
    };
}

describe("addTab", () => {
    it("creates a brand-new window when the layout is undefined", () => {
        const tab = new TabData("First");
        const result = LaymanReducer(undefined, {type: "addTab", path: [], tab});

        expect(result).toEqual({tabs: [tab]});
    });

    it("appends a tab to the root window (path [])", () => {
        const existing = new TabData("Existing");
        const added = new TabData("Added");
        const layout = makeWindow(existing);

        const result = LaymanReducer(layout, {type: "addTab", path: [], tab: added}) as LaymanWindow;

        expect(result.tabs).toEqual([existing, added]);
        // original layout must not be mutated
        expect(layout.tabs).toEqual([existing]);
    });

    it("appends a tab to a nested window (path [1])", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const added = new TabData("Added");
        const layout = makeRowOfTwo(left, right);

        const result = LaymanReducer(layout, {type: "addTab", path: [1], tab: added}) as LaymanNode;

        const targetWindow = result.children[1] as LaymanWindow;
        expect(targetWindow.tabs).toEqual([right, added]);
        // sibling window is untouched
        expect((result.children[0] as LaymanWindow).tabs).toEqual([left]);
    });

    it("returns the layout unchanged when the path points at a node, not a window", () => {
        const layout = makeRowOfTwo(new TabData("Left"), new TabData("Right"));
        const result = LaymanReducer(layout, {type: "addTab", path: [], tab: new TabData("Nope")});

        expect(result).toBe(layout);
    });
});

describe("removeTab", () => {
    it("removes a tab from a window that has multiple tabs", () => {
        const a = new TabData("A");
        const b = new TabData("B");
        const c = new TabData("C");
        const layout = makeWindow(a, b, c);

        const result = LaymanReducer(layout, {type: "removeTab", path: [], tab: b}) as LaymanWindow;

        expect(result.tabs).toEqual([a, c]);
    });

    it("decrements selectedIndex when a tab left of the selection is removed", () => {
        const a = new TabData("A");
        const b = new TabData("B");
        const c = new TabData("C");
        const layout: LaymanWindow = {tabs: [a, b, c], selectedIndex: 2};

        const result = LaymanReducer(layout, {type: "removeTab", path: [], tab: a}) as LaymanWindow;

        expect(result.tabs).toEqual([b, c]);
        expect(result.selectedIndex).toBe(1);
    });

    it("removes the window entirely when its only tab is removed (cascade to removeWindow)", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const layout = makeRowOfTwo(left, right);

        // Remove the only tab in the left window -> left window disappears,
        // leaving just the right window hoisted to the root.
        const result = LaymanReducer(layout, {type: "removeTab", path: [0], tab: left}) as LaymanWindow;

        expect("tabs" in result).toBe(true);
        expect(result.tabs).toEqual([right]);
    });

    it("clears the whole layout when the only tab of the only root window is removed", () => {
        const only = new TabData("Only");
        const layout = makeWindow(only);

        const result = LaymanReducer(layout, {type: "removeTab", path: [], tab: only});

        expect(result).toBeUndefined();
    });
});

describe("moveTab", () => {
    it("moves a tab into another window with 'center' placement", () => {
        const leftA = new TabData("LeftA");
        const leftB = new TabData("LeftB");
        const right = new TabData("Right");
        // Left window keeps two tabs so it survives the move (no collapse/reindex).
        const layout: LaymanNode = {
            direction: "row",
            children: [
                {tabs: [leftA, leftB], selectedIndex: 0, viewPercent: 50},
                {tabs: [right], selectedIndex: 0, viewPercent: 50},
            ],
        };

        // Move LeftB out of the left window into the right window's tab strip.
        const result = LaymanReducer(layout, {
            type: "moveTab",
            path: [0],
            newPath: [1],
            tab: leftB,
            placement: "center",
        }) as LaymanNode;

        expect((result.children[0] as LaymanWindow).tabs).toEqual([leftA]);
        expect((result.children[1] as LaymanWindow).tabs).toEqual([right, leftB]);
    });

    it("creates a new split window when a tab is moved to an edge placement", () => {
        const a = new TabData("A");
        const b = new TabData("B");
        // Single window with two tabs so the source survives the move.
        const layout = makeWindow(a, b);

        const result = LaymanReducer(layout, {
            type: "moveTab",
            path: [],
            newPath: [],
            tab: b,
            placement: "right",
        }) as LaymanNode;

        expect("children" in result).toBe(true);
        expect(result.direction).toBe("row");
        // original window (now just tab A) on the left, new window (tab B) on the right
        expect((result.children[0] as LaymanWindow).tabs).toEqual([a]);
        expect((result.children[1] as LaymanWindow).tabs).toEqual([b]);
    });

    it("does not remove from the origin when the tab comes from outside (path [-1])", () => {
        const existing = new TabData("Existing");
        const external = new TabData("External");
        const layout = makeWindow(existing);

        const result = LaymanReducer(layout, {
            type: "moveTab",
            path: [-1],
            newPath: [],
            tab: external,
            placement: "center",
        }) as LaymanWindow;

        expect(result.tabs).toEqual([existing, external]);
    });
});

describe("removeWindow", () => {
    it("collapses a two-window split into the remaining window", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const layout = makeRowOfTwo(left, right);

        const result = LaymanReducer(layout, {type: "removeWindow", path: [0]}) as LaymanWindow;

        expect("tabs" in result).toBe(true);
        expect(result.tabs).toEqual([right]);
    });

    it("keeps the node and recomputes sibling viewPercents when 3+ children remain", () => {
        const layout: LaymanNode = {
            direction: "row",
            children: [
                {tabs: [new TabData("A")], selectedIndex: 0, viewPercent: 25},
                {tabs: [new TabData("B")], selectedIndex: 0, viewPercent: 25},
                {tabs: [new TabData("C")], selectedIndex: 0, viewPercent: 50},
            ],
        };

        const result = LaymanReducer(layout, {type: "removeWindow", path: [2]}) as LaymanNode;

        expect("children" in result).toBe(true);
        expect(result.children).toHaveLength(2);
        const total = result.children.reduce((sum, child) => sum + (child!.viewPercent ?? 0), 0);
        // The remaining children's percentages are rescaled to fill 100%.
        expect(total).toBeCloseTo(100);
    });

    it("clears the layout when the only root window is removed", () => {
        const layout = makeWindow(new TabData("Only"));
        const result = LaymanReducer(layout, {type: "removeWindow", path: []});

        expect(result).toBeUndefined();
    });
});
