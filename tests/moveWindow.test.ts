import {describe, expect, it} from "vitest";
import {LaymanReducer} from "../src/LaymanReducer";
import {TabData} from "../src/TabData";
import {FloatingWindowData, LaymanNode, LaymanState, LaymanWindow} from "../src/types";

const windowWith = (...tabs: TabData[]): LaymanWindow => ({tabs, selectedIndex: 0});

const rowOfTwo = (left: TabData, right: TabData): LaymanNode => ({
    direction: "row",
    children: [windowWith(left), windowWith(right)],
});

const floatingWindow = (id: string, ...tabs: TabData[]): FloatingWindowData => ({
    id,
    tabs,
    selectedIndex: 0,
    position: {top: 10, left: 10, width: 300, height: 200},
    zIndex: 30,
});

describe("moveWindow atomicity", () => {
    it("preserves the complete state for an invalid tiled destination", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const state: LaymanState = {layout: rowOfTwo(left, right), floatingWindows: []};

        const result = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: [99],
            window: windowWith(left),
            placement: "center",
        });

        expect(result).toBe(state);
    });

    it("preserves the complete state for an invalid floating destination", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const state: LaymanState = {layout: rowOfTwo(left, right), floatingWindows: []};

        const result = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: {floatingId: "new-float"},
            window: windowWith(left),
            placement: "center",
        });

        const missingId = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: {floatingId: ""},
            window: windowWith(left),
            placement: "center",
            position: {top: 0, left: 0, width: 100, height: 100},
        });

        expect(result).toBe(state);
        expect(missingId).toBe(state);
    });

    it("moves the stored source window instead of a stale action payload", () => {
        const sourceTab = new TabData("Stored source");
        const targetTab = new TabData("Target");
        const forgedTab = new TabData("Forged");
        const state: LaymanState = {layout: rowOfTwo(sourceTab, targetTab), floatingWindows: []};

        const result = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: [1],
            window: windowWith(forgedTab),
            placement: "center",
        });

        expect((result.layout as LaymanWindow).tabs).toEqual([targetTab, sourceTab]);
        expect((result.layout as LaymanWindow).tabs).not.toContain(forgedTab);
    });

    it("adjusts a sibling destination after removing the source window", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const state: LaymanState = {layout: rowOfTwo(left, right), floatingWindows: []};

        const result = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: [1],
            window: windowWith(left),
            placement: "center",
        });

        expect((result.layout as LaymanWindow).tabs).toEqual([right, left]);
    });

    it("uses the resolved source tabs for a new floating window", () => {
        const sourceTab = new TabData("Stored source");
        const right = new TabData("Right");
        const forgedTab = new TabData("Forged");
        const position = {top: 5, left: 8, width: 320, height: 240};
        const state: LaymanState = {layout: rowOfTwo(sourceTab, right), floatingWindows: []};

        const result = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: {floatingId: "new-float"},
            window: windowWith(forgedTab),
            placement: "center",
            position,
        });

        expect((result.layout as LaymanWindow).tabs).toEqual([right]);
        expect(result.floatingWindows).toHaveLength(1);
        expect(result.floatingWindows[0]).toMatchObject({id: "new-float", tabs: [sourceTab], position});
    });

    it("rejects a floating edge drop and a destination inside the source subtree", () => {
        const left = new TabData("Left");
        const right = new TabData("Right");
        const float = floatingWindow("float-1", new TabData("Floating"));
        const state: LaymanState = {layout: rowOfTwo(left, right), floatingWindows: [float]};

        const floatingEdge = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: {floatingId: "float-1"},
            window: windowWith(left),
            placement: "left",
        });
        const selfTarget = LaymanReducer(state, {
            type: "moveWindow",
            path: [0],
            newPath: [0],
            window: windowWith(left),
            placement: "right",
        });

        expect(floatingEdge).toBe(state);
        expect(selfTarget).toBe(state);
    });
});
