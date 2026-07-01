import {describe, it, expect} from "vitest";
import {
    serializeLayout,
    deserializeLayout,
    deserializeTab,
    serializeFloatingWindow,
    deserializeFloatingWindow,
} from "../src/Serializer";
import {TabData} from "../src/TabData";
import {FloatingWindowData, LaymanNode, LaymanWindow, LaymanSerializedTab} from "../src/types";

describe("serializeLayout", () => {
    it("returns null for an undefined layout", () => {
        expect(serializeLayout(undefined)).toBeNull();
    });

    it("serializes a window, preserving tabs, options and viewPercent", () => {
        const window: LaymanWindow = {
            viewPercent: 42,
            selectedIndex: 1,
            tabs: [new TabData("Editor", {path: "/a.ts"}), new TabData("Preview")],
        };

        expect(serializeLayout(window)).toEqual({
            kind: "window",
            selectedIndex: 1,
            viewPercent: 42,
            tabs: [
                {name: "Editor", options: {path: "/a.ts"}},
                {name: "Preview", options: {}},
            ],
        });
    });

    it("defaults selectedIndex to 0 when omitted", () => {
        const window: LaymanWindow = {tabs: [new TabData("Only")]};
        const result = serializeLayout(window);
        expect(result).toMatchObject({kind: "window", selectedIndex: 0});
    });

    it("serializes a node, preserving direction, viewPercent and recursing into children", () => {
        const node: LaymanNode = {
            direction: "row",
            viewPercent: 60,
            children: [
                {tabs: [new TabData("Left")], selectedIndex: 0},
                {tabs: [new TabData("Right")], selectedIndex: 0},
            ],
        };

        expect(serializeLayout(node)).toEqual({
            kind: "node",
            direction: "row",
            viewPercent: 60,
            children: [
                {kind: "window", selectedIndex: 0, viewPercent: undefined, tabs: [{name: "Left", options: {}}]},
                {kind: "window", selectedIndex: 0, viewPercent: undefined, tabs: [{name: "Right", options: {}}]},
            ],
        });
    });
});

describe("deserializeTab", () => {
    it("reconstructs a TabData instance with name, cloned options and a fresh id", () => {
        const serialized: LaymanSerializedTab = {name: "Term", options: {cwd: "/tmp"}};
        const tab = deserializeTab(serialized);

        expect(tab).toBeInstanceOf(TabData);
        expect(tab.name).toBe("Term");
        expect(tab.options).toEqual({cwd: "/tmp"});
        // options must be a copy, not the same reference as the serialized input
        expect(tab.options).not.toBe(serialized.options);
        expect(typeof tab.id).toBe("string");
        expect(tab.id.length).toBeGreaterThan(0);
    });
});

describe("deserializeLayout", () => {
    it("returns undefined for a null serialized layout", () => {
        expect(deserializeLayout(null)).toBeUndefined();
    });

    it("reconstructs a window with TabData instances", () => {
        const result = deserializeLayout({
            kind: "window",
            selectedIndex: 2,
            viewPercent: 25,
            tabs: [{name: "A", options: {}}, {name: "B", options: {flag: true}}],
        }) as LaymanWindow;

        expect(result.selectedIndex).toBe(2);
        expect(result.viewPercent).toBe(25);
        expect(result.tabs).toHaveLength(2);
        expect(result.tabs[0]).toBeInstanceOf(TabData);
        expect(result.tabs[1].options).toEqual({flag: true});
    });
});

describe("serializeFloatingWindow / deserializeFloatingWindow", () => {
    it("round-trips a floating window, preserving position, zIndex and tab data", () => {
        const original: FloatingWindowData = {
            id: "float-1",
            selectedIndex: 1,
            position: {top: 10, left: 20, width: 300, height: 200},
            zIndex: 32,
            tabs: [new TabData("A", {path: "/a"}), new TabData("B")],
        };

        const serialized = serializeFloatingWindow(original);
        expect(serialized).toEqual({
            id: "float-1",
            selectedIndex: 1,
            position: {top: 10, left: 20, width: 300, height: 200},
            zIndex: 32,
            tabs: [
                {name: "A", options: {path: "/a"}},
                {name: "B", options: {}},
            ],
        });

        const restored = deserializeFloatingWindow(serialized);
        expect(restored.id).toBe("float-1");
        expect(restored.selectedIndex).toBe(1);
        expect(restored.position).toEqual(original.position);
        expect(restored.zIndex).toBe(32);
        expect(restored.tabs).toHaveLength(2);
        expect(restored.tabs[0]).toBeInstanceOf(TabData);
        expect(restored.tabs[0].options).toEqual({path: "/a"});
    });
});

describe("round-trip (serialize -> deserialize)", () => {
    it("preserves the structure and values of a nested layout", () => {
        const original: LaymanNode = {
            direction: "column",
            viewPercent: 50,
            children: [
                {
                    direction: "row",
                    children: [
                        {tabs: [new TabData("One", {x: 1})], selectedIndex: 0, viewPercent: 30},
                        {tabs: [new TabData("Two")], selectedIndex: 0, viewPercent: 70},
                    ],
                },
                {tabs: [new TabData("Three"), new TabData("Four")], selectedIndex: 1},
            ],
        };

        const restored = deserializeLayout(serializeLayout(original));

        // Re-serializing the restored layout must equal the first serialization,
        // i.e. the round-trip is structurally lossless (ids excluded by design).
        expect(serializeLayout(restored)).toEqual(serializeLayout(original));
    });
});
