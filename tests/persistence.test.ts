import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {loadState, saveState} from "../src/persistence";
import {serializeLayout} from "../src/Serializer";
import {TabData} from "../src/TabData";
import {FloatingWindowData, LaymanNode, LaymanState, LaymanWindow} from "../src/types";

const KEY = "layman-test-layout";

function makeLayout(): LaymanNode {
    return {
        direction: "row",
        viewPercent: 50,
        children: [
            {tabs: [new TabData("Left", {path: "/a"})], selectedIndex: 0},
            {tabs: [new TabData("Right")], selectedIndex: 0},
        ],
    };
}

function makeFloatingWindows(): FloatingWindowData[] {
    return [
        {
            id: "float-1",
            tabs: [new TabData("Floater", {kind: "note"})],
            selectedIndex: 0,
            position: {top: 10, left: 20, width: 300, height: 200},
            zIndex: 30,
        },
    ];
}

describe("saveState / loadState", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("saveState is a no-op when no storageKey is provided", () => {
        saveState(undefined, {layout: makeLayout(), floatingWindows: []});
        expect(window.localStorage.length).toBe(0);
    });

    it("loadState returns the fallback when no storageKey is provided", () => {
        const fallback: LaymanState = {layout: {tabs: [new TabData("Fallback")]}, floatingWindows: []};
        expect(loadState(undefined, fallback)).toBe(fallback);
    });

    it("saveState writes the serialized layout as JSON under the key", () => {
        const layout = makeLayout();
        saveState(KEY, {layout, floatingWindows: []});

        const raw = window.localStorage.getItem(KEY);
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw as string).layout).toEqual(serializeLayout(layout));
    });

    it("round-trips a layout through save then load", () => {
        const layout = makeLayout();
        const fallback: LaymanState = {layout: {tabs: []}, floatingWindows: []};

        saveState(KEY, {layout, floatingWindows: []});
        const restored = loadState(KEY, fallback);

        // Structurally equal (re-serialize to ignore freshly minted tab ids).
        expect(serializeLayout(restored.layout)).toEqual(serializeLayout(layout));
        // Restored tabs are real TabData instances.
        const node = restored.layout as LaymanNode;
        const firstWindow = node.children[0] as LaymanWindow;
        expect(firstWindow.tabs[0]).toBeInstanceOf(TabData);
        expect(firstWindow.tabs[0].options).toEqual({path: "/a"});
    });

    it("round-trips floating windows through save then load", () => {
        const layout = makeLayout();
        const floatingWindows = makeFloatingWindows();
        const fallback: LaymanState = {layout: {tabs: []}, floatingWindows: []};

        saveState(KEY, {layout, floatingWindows});
        const restored = loadState(KEY, fallback);

        expect(restored.floatingWindows).toHaveLength(1);
        expect(restored.floatingWindows[0]).toMatchObject({
            id: "float-1",
            selectedIndex: 0,
            position: floatingWindows[0].position,
            zIndex: 30,
        });
        expect(restored.floatingWindows[0].tabs[0]).toBeInstanceOf(TabData);
        expect(restored.floatingWindows[0].tabs[0].name).toBe("Floater");
        expect(restored.floatingWindows[0].tabs[0].options).toEqual({kind: "note"});
    });

    it("loadState returns the fallback when the key is missing in storage", () => {
        const fallback: LaymanState = {layout: {tabs: [new TabData("Fallback")]}, floatingWindows: []};
        expect(loadState("does-not-exist", fallback)).toBe(fallback);
    });

    it("loadState returns the fallback and warns when stored JSON is corrupt", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        window.localStorage.setItem(KEY, "{not valid json");

        const fallback: LaymanState = {layout: {tabs: [new TabData("Fallback")]}, floatingWindows: []};
        expect(loadState(KEY, fallback)).toBe(fallback);
        expect(warn).toHaveBeenCalled();
    });
});
