import {describe, it, expect} from "vitest";
import {deepClone, deepEqual} from "../src/utils";
import {TabData} from "../src/TabData";
import {LaymanNode} from "../src/types";

describe("deepClone", () => {
    it("returns primitives unchanged", () => {
        expect(deepClone(42)).toBe(42);
        expect(deepClone("hi")).toBe("hi");
        expect(deepClone(true)).toBe(true);
        expect(deepClone(null)).toBeNull();
        expect(deepClone(undefined)).toBeUndefined();
    });

    it("clones nested objects/arrays without sharing references", () => {
        const original = {a: 1, b: {c: [1, 2, {d: 3}]}};
        const cloned = deepClone(original);

        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
        expect(cloned.b).not.toBe(original.b);
        expect(cloned.b.c).not.toBe(original.b.c);
        expect(cloned.b.c[2]).not.toBe(original.b.c[2]);
    });

    it("mutating the clone does not affect the original", () => {
        const original = {nested: {value: 1}};
        const cloned = deepClone(original);
        cloned.nested.value = 99;
        expect(original.nested.value).toBe(1);
    });

    it("preserves class prototypes (TabData stays a TabData instance)", () => {
        const tab = new TabData("Editor", {path: "/a.ts"});
        const cloned = deepClone(tab);

        expect(cloned).toBeInstanceOf(TabData);
        expect(cloned).not.toBe(tab);
        expect(cloned.id).toBe(tab.id);
        expect(cloned.name).toBe("Editor");
        expect(cloned.options).toEqual({path: "/a.ts"});
        expect(cloned.options).not.toBe(tab.options);
    });

    it("deep-clones a full layout tree containing TabData instances", () => {
        const layout: LaymanNode = {
            direction: "row",
            children: [
                {tabs: [new TabData("A"), new TabData("B")], selectedIndex: 0, viewPercent: 50},
                {tabs: [new TabData("C")], selectedIndex: 0, viewPercent: 50},
            ],
        };

        const cloned = deepClone(layout);

        expect(cloned).toEqual(layout);
        expect(cloned).not.toBe(layout);
        const window0 = cloned.children[0] as {tabs: TabData[]};
        expect(window0.tabs[0]).toBeInstanceOf(TabData);
        expect(window0.tabs[0]).not.toBe((layout.children[0] as {tabs: TabData[]}).tabs[0]);
    });

    it("clones Date and RegExp values", () => {
        const date = new Date(1000);
        const clonedDate = deepClone(date);
        expect(clonedDate).toBeInstanceOf(Date);
        expect(clonedDate.getTime()).toBe(1000);
        expect(clonedDate).not.toBe(date);

        const re = /abc/gi;
        const clonedRe = deepClone(re);
        expect(clonedRe).toBeInstanceOf(RegExp);
        expect(clonedRe.source).toBe("abc");
        expect(clonedRe.flags).toBe("gi");
    });
});

describe("deepEqual", () => {
    it("compares primitives", () => {
        expect(deepEqual(1, 1)).toBe(true);
        expect(deepEqual("a", "a")).toBe(true);
        expect(deepEqual(1, 2)).toBe(false);
        expect(deepEqual(1, "1")).toBe(false);
        expect(deepEqual(null, null)).toBe(true);
        expect(deepEqual(null, undefined)).toBe(false);
    });

    it("treats NaN as equal to NaN", () => {
        expect(deepEqual(NaN, NaN)).toBe(true);
    });

    it("compares numeric path arrays (the Separator use case)", () => {
        expect(deepEqual([0, 1, 2], [0, 1, 2])).toBe(true);
        expect(deepEqual([0, 1], [0, 1, 2])).toBe(false);
        expect(deepEqual([0, 1, 2], [0, 9, 2])).toBe(false);
        expect(deepEqual([], [])).toBe(true);
    });

    it("distinguishes arrays from objects", () => {
        expect(deepEqual([1, 2], {0: 1, 1: 2})).toBe(false);
    });

    it("compares nested objects structurally", () => {
        expect(deepEqual({a: {b: [1, 2]}}, {a: {b: [1, 2]}})).toBe(true);
        expect(deepEqual({a: {b: [1, 2]}}, {a: {b: [1, 3]}})).toBe(false);
    });

    it("returns false when key sets differ", () => {
        expect(deepEqual({a: 1}, {a: 1, b: 2})).toBe(false);
        expect(deepEqual({a: 1, b: undefined}, {a: 1})).toBe(false);
    });

    it("compares Date and RegExp values", () => {
        expect(deepEqual(new Date(5), new Date(5))).toBe(true);
        expect(deepEqual(new Date(5), new Date(6))).toBe(false);
        expect(deepEqual(/x/g, /x/g)).toBe(true);
        expect(deepEqual(/x/g, /x/i)).toBe(false);
    });
});
