import {describe, expect, it} from "vitest";

describe.sequential("test localStorage", () => {
    it("writes a value", () => {
        window.localStorage.setItem("set-by-previous-test", "present");
        expect(window.localStorage.getItem("set-by-previous-test")).toBe("present");
    });

    it("does not expose values from a previous test", () => {
        expect(window.localStorage.getItem("set-by-previous-test")).toBeNull();
    });
});
