import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {loadLayout, saveLayout} from "../src/persistence";
import {serializeLayout} from "../src/Serializer";
import {TabData} from "../src/TabData";
import {LaymanNode, LaymanWindow} from "../src/types";

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

describe("saveLayout / loadLayout", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("saveLayout is a no-op when no storageKey is provided", () => {
        saveLayout(undefined, makeLayout());
        expect(window.localStorage.length).toBe(0);
    });

    it("loadLayout returns the fallback when no storageKey is provided", () => {
        const fallback: LaymanWindow = {tabs: [new TabData("Fallback")]};
        expect(loadLayout(undefined, fallback)).toBe(fallback);
    });

    it("saveLayout writes the serialized layout as JSON under the key", () => {
        const layout = makeLayout();
        saveLayout(KEY, layout);

        const raw = window.localStorage.getItem(KEY);
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw as string)).toEqual(serializeLayout(layout));
    });

    it("round-trips a layout through save then load", () => {
        const layout = makeLayout();
        const fallback: LaymanWindow = {tabs: []};

        saveLayout(KEY, layout);
        const restored = loadLayout(KEY, fallback);

        // Structurally equal (re-serialize to ignore freshly minted tab ids).
        expect(serializeLayout(restored)).toEqual(serializeLayout(layout));
        // Restored tabs are real TabData instances.
        const node = restored as LaymanNode;
        const firstWindow = node.children[0] as LaymanWindow;
        expect(firstWindow.tabs[0]).toBeInstanceOf(TabData);
        expect(firstWindow.tabs[0].options).toEqual({path: "/a"});
    });

    it("loadLayout returns the fallback when the key is missing in storage", () => {
        const fallback: LaymanWindow = {tabs: [new TabData("Fallback")]};
        expect(loadLayout("does-not-exist", fallback)).toBe(fallback);
    });

    it("loadLayout returns the fallback and warns when stored JSON is corrupt", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        window.localStorage.setItem(KEY, "{not valid json");

        const fallback: LaymanWindow = {tabs: [new TabData("Fallback")]};
        expect(loadLayout(KEY, fallback)).toBe(fallback);
        expect(warn).toHaveBeenCalled();
    });
});
