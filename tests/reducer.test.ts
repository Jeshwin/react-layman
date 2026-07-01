import {describe, it, expect} from "vitest";
import {LaymanReducer} from "../src/LaymanReducer";
import {TabData} from "../src/TabData";
import {FloatingWindowData, LaymanLayout, LaymanLayoutAction, LaymanNode, LaymanState, LaymanWindow} from "../src/types";

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

/** A floating window holding the given tabs at selectedIndex 0. */
function makeFloatingWindow(id: string, ...tabs: TabData[]): FloatingWindowData {
    return {
        id,
        tabs,
        selectedIndex: 0,
        position: {top: 10, left: 10, width: 300, height: 200},
        zIndex: 30,
    };
}

/** Runs the reducer against a tree-only state and returns the resulting layout. */
function runLayout(layout: LaymanLayout, action: LaymanLayoutAction): LaymanLayout {
    return LaymanReducer({layout, floatingWindows: []}, action).layout;
}

/** Runs the reducer against a full state (tree + floating windows). */
function run(state: LaymanState, action: LaymanLayoutAction): LaymanState {
    return LaymanReducer(state, action);
}

describe("addTab", () => {
    it("creates a brand-new window when the layout is undefined", () => {
        const tab = new TabData("First");
        const result = runLayout(undefined, {type: "addTab", path: [], tab});

        expect(result).toEqual({tabs: [tab]});
    });

    it("appends a tab to the root window (path [])", () => {
        const existing = new TabData("Existing");
        const added = new TabData("Added");
        const layout = makeWindow(existing);

        const result = runLayout(layout, {type: "addTab", path: [], tab: added}) as LaymanWindow;

        expect(result.tabs).toEqual([existing, added]);
        // original layout must not be mutated
        expect(layout.tabs).toEqual([existing]);
    });

    it("appends a tab to a nested window (path [1])", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const added = new TabData("Added");
        const layout = makeRowOfTwo(left, right);

        const result = runLayout(layout, {type: "addTab", path: [1], tab: added}) as LaymanNode;

        const targetWindow = result.children[1] as LaymanWindow;
        expect(targetWindow.tabs).toEqual([right, added]);
        // sibling window is untouched
        expect((result.children[0] as LaymanWindow).tabs).toEqual([left]);
    });

    it("returns the layout unchanged when the path points at a node, not a window", () => {
        const layout = makeRowOfTwo(new TabData("Left"), new TabData("Right"));
        const result = runLayout(layout, {type: "addTab", path: [], tab: new TabData("Nope")});

        expect(result).toBe(layout);
    });

    it("adds a tab to an existing floating window, addressed by floatingId", () => {
        const existing = new TabData("Existing");
        const added = new TabData("Added");
        const floatingWindow = makeFloatingWindow("float-1", existing);
        const state: LaymanState = {layout: undefined, floatingWindows: [floatingWindow]};

        const result = run(state, {type: "addTab", path: {floatingId: "float-1"}, tab: added});

        expect(result.floatingWindows[0].tabs).toEqual([existing, added]);
        // original state must not be mutated
        expect(floatingWindow.tabs).toEqual([existing]);
    });
});

describe("removeTab", () => {
    it("removes a tab from a window that has multiple tabs", () => {
        const a = new TabData("A");
        const b = new TabData("B");
        const c = new TabData("C");
        const layout = makeWindow(a, b, c);

        const result = runLayout(layout, {type: "removeTab", path: [], tab: b}) as LaymanWindow;

        expect(result.tabs).toEqual([a, c]);
    });

    it("decrements selectedIndex when a tab left of the selection is removed", () => {
        const a = new TabData("A");
        const b = new TabData("B");
        const c = new TabData("C");
        const layout: LaymanWindow = {tabs: [a, b, c], selectedIndex: 2};

        const result = runLayout(layout, {type: "removeTab", path: [], tab: a}) as LaymanWindow;

        expect(result.tabs).toEqual([b, c]);
        expect(result.selectedIndex).toBe(1);
    });

    it("removes the window entirely when its only tab is removed (cascade to removeWindow)", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const layout = makeRowOfTwo(left, right);

        // Remove the only tab in the left window -> left window disappears,
        // leaving just the right window hoisted to the root.
        const result = runLayout(layout, {type: "removeTab", path: [0], tab: left}) as LaymanWindow;

        expect("tabs" in result).toBe(true);
        expect(result.tabs).toEqual([right]);
    });

    it("clears the whole layout when the only tab of the only root window is removed", () => {
        const only = new TabData("Only");
        const layout = makeWindow(only);

        const result = runLayout(layout, {type: "removeTab", path: [], tab: only});

        expect(result).toBeUndefined();
    });

    it("closes a floating window entirely when its only tab is removed", () => {
        const only = new TabData("Only");
        const floatingWindow = makeFloatingWindow("float-1", only);
        const state: LaymanState = {layout: undefined, floatingWindows: [floatingWindow]};

        const result = run(state, {type: "removeTab", path: {floatingId: "float-1"}, tab: only});

        expect(result.floatingWindows).toEqual([]);
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
        const result = runLayout(layout, {
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

        const result = runLayout(layout, {
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

        const result = runLayout(layout, {
            type: "moveTab",
            path: [-1],
            newPath: [],
            tab: external,
            placement: "center",
        }) as LaymanWindow;

        expect(result.tabs).toEqual([existing, external]);
    });

    it("moves a tab out of the tree into an existing floating window", () => {
        const a = new TabData("A");
        const b = new TabData("B");
        const layout = makeWindow(a, b);
        const floatingWindow = makeFloatingWindow("float-1", new TabData("Existing"));
        const state: LaymanState = {layout, floatingWindows: [floatingWindow]};

        const result = run(state, {
            type: "moveTab",
            path: [],
            newPath: {floatingId: "float-1"},
            tab: b,
            placement: "center",
        });

        expect((result.layout as LaymanWindow).tabs).toEqual([a]);
        expect(result.floatingWindows[0].tabs.map((t) => t.name)).toEqual(["Existing", "B"]);
    });

    it("moves a tab out of a floating window into the tree", () => {
        const a = new TabData("A");
        const b = new TabData("B");
        const layout = makeWindow(a);
        const floatingWindow = makeFloatingWindow("float-1", b, new TabData("Stays"));
        const state: LaymanState = {layout, floatingWindows: [floatingWindow]};

        const result = run(state, {
            type: "moveTab",
            path: {floatingId: "float-1"},
            newPath: [],
            tab: b,
            placement: "center",
        });

        expect((result.layout as LaymanWindow).tabs).toEqual([a, b]);
        expect(result.floatingWindows[0].tabs.map((t) => t.name)).toEqual(["Stays"]);
    });
});

describe("removeWindow", () => {
    it("collapses a two-window split into the remaining window", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const layout = makeRowOfTwo(left, right);

        const result = runLayout(layout, {type: "removeWindow", path: [0]}) as LaymanWindow;

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

        const result = runLayout(layout, {type: "removeWindow", path: [2]}) as LaymanNode;

        expect("children" in result).toBe(true);
        expect(result.children).toHaveLength(2);
        const total = result.children.reduce((sum, child) => sum + (child!.viewPercent ?? 0), 0);
        // The remaining children's percentages are rescaled to fill 100%.
        expect(total).toBeCloseTo(100);
    });

    it("clears the layout when the only root window is removed", () => {
        const layout = makeWindow(new TabData("Only"));
        const result = runLayout(layout, {type: "removeWindow", path: []});

        expect(result).toBeUndefined();
    });

    it("closes a floating window, leaving the tree untouched", () => {
        const layout = makeWindow(new TabData("Root"));
        const floatingWindow = makeFloatingWindow("float-1", new TabData("Floater"));
        const state: LaymanState = {layout, floatingWindows: [floatingWindow]};

        const result = run(state, {type: "removeWindow", path: {floatingId: "float-1"}});

        expect(result.floatingWindows).toEqual([]);
        expect(result.layout).toBe(layout);
    });
});

describe("moveWindow (floating)", () => {
    it("floats a tree window into a brand new floating window, preserving tab identity", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const layout = makeRowOfTwo(left, right);
        const state: LaymanState = {layout, floatingWindows: []};

        const result = run(state, {
            type: "moveWindow",
            path: [0],
            newPath: {floatingId: "new-float"},
            window: {tabs: [left], selectedIndex: 0},
            placement: "center",
            position: {top: 5, left: 5, width: 250, height: 150},
        });

        // Removed from the tree...
        expect("tabs" in (result.layout as LaymanWindow)).toBe(true);
        expect((result.layout as LaymanWindow).tabs).toEqual([right]);
        // ...and floating with the exact same TabData object (not recreated).
        expect(result.floatingWindows).toHaveLength(1);
        expect(result.floatingWindows[0].id).toBe("new-float");
        expect(result.floatingWindows[0].tabs[0]).toBe(left);
        expect(result.floatingWindows[0].position).toEqual({top: 5, left: 5, width: 250, height: 150});
    });

    it("does nothing when floating a window without a seed position", () => {
        const layout = makeWindow(new TabData("Only"));
        const state: LaymanState = {layout, floatingWindows: []};

        const result = run(state, {
            type: "moveWindow",
            path: [],
            newPath: {floatingId: "new-float"},
            window: {tabs: layout.tabs, selectedIndex: 0},
            placement: "center",
        });

        expect(result).toBe(state);
    });

    it("unfloats a floating window into the tree", () => {
        const root = new TabData("Root");
        const layout = makeWindow(root);
        const floaterTab = new TabData("Floater");
        const floatingWindow = makeFloatingWindow("float-1", floaterTab);
        const state: LaymanState = {layout, floatingWindows: [floatingWindow]};

        const result = run(state, {
            type: "moveWindow",
            path: {floatingId: "float-1"},
            newPath: [],
            window: {tabs: [floaterTab], selectedIndex: 0},
            placement: "center",
        });

        expect(result.floatingWindows).toEqual([]);
        expect((result.layout as LaymanWindow).tabs).toEqual([root, floaterTab]);
    });

    it("merges tabs when dragged onto an already-floating window", () => {
        const tabA = new TabData("A");
        const tabB = new TabData("B");
        const floatA = makeFloatingWindow("float-a", tabA);
        const floatB = makeFloatingWindow("float-b", tabB);
        const state: LaymanState = {layout: undefined, floatingWindows: [floatA, floatB]};

        const result = run(state, {
            type: "moveWindow",
            path: {floatingId: "float-a"},
            newPath: {floatingId: "float-b"},
            window: {tabs: [tabA], selectedIndex: 0},
            placement: "center",
        });

        expect(result.floatingWindows).toHaveLength(1);
        expect(result.floatingWindows[0].id).toBe("float-b");
        expect(result.floatingWindows[0].tabs).toEqual([tabB, tabA]);
    });
});

describe("setFloatingWindowPosition", () => {
    it("updates only the targeted floating window's position", () => {
        const floatA = makeFloatingWindow("float-a", new TabData("A"));
        const floatB = makeFloatingWindow("float-b", new TabData("B"));
        const state: LaymanState = {layout: undefined, floatingWindows: [floatA, floatB]};

        const newPosition = {top: 100, left: 100, width: 400, height: 300};
        const result = run(state, {type: "setFloatingWindowPosition", floatingId: "float-a", position: newPosition});

        expect(result.floatingWindows[0].position).toEqual(newPosition);
        expect(result.floatingWindows[1].position).toEqual(floatB.position);
    });
});

describe("bringFloatingWindowToFront", () => {
    it("raises the targeted floating window's zIndex above its siblings", () => {
        const floatA = {...makeFloatingWindow("float-a", new TabData("A")), zIndex: 30};
        const floatB = {...makeFloatingWindow("float-b", new TabData("B")), zIndex: 31};
        const state: LaymanState = {layout: undefined, floatingWindows: [floatA, floatB]};

        const result = run(state, {type: "bringFloatingWindowToFront", floatingId: "float-a"});

        expect(result.floatingWindows[0].zIndex).toBe(32);
        expect(result.floatingWindows[1].zIndex).toBe(31);
    });

    it("is a no-op when the window is already on top", () => {
        const floatA = {...makeFloatingWindow("float-a", new TabData("A")), zIndex: 31};
        const floatB = {...makeFloatingWindow("float-b", new TabData("B")), zIndex: 30};
        const state: LaymanState = {layout: undefined, floatingWindows: [floatA, floatB]};

        const result = run(state, {type: "bringFloatingWindowToFront", floatingId: "float-a"});

        expect(result).toBe(state);
    });
});
