import {fireEvent, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect, test} from "vitest";
import {LaymanWindow} from "../src/types";
import {
    makeFloatingWindow,
    makeTab,
    makeTiledLayout,
    makeWindow,
    renderLayman,
    setupComponentTestEnvironment,
} from "./componentHarness";

setupComponentTestEnvironment();

const user = () => userEvent.setup();

test("renders the null layout view", () => {
    renderLayman();

    expect(screen.getByText("Empty layout")).toBeTruthy();
});

test("selects a tab through the rendered toolbar", async () => {
    const first = makeTab("First");
    const second = makeTab("Second");
    const {states} = renderLayman({initialLayout: makeTiledLayout(first, second)});

    await user().click(screen.getByRole("button", {name: "Second"}));

    await waitFor(() => {
        const layout = states.at(-1)?.layout as LaymanWindow;
        expect(layout.selectedIndex).toBe(1);
    });
    expect(screen.getByRole("region", {name: "Second pane"})).toBeTruthy();
});

test("closes a tab through the rendered toolbar", async () => {
    const first = makeTab("First");
    const second = makeTab("Second");
    const {states} = renderLayman({initialLayout: makeTiledLayout(first, second), mutable: true});

    await user().click(screen.getByRole("button", {name: "Close Second"}));

    await waitFor(() => {
        const layout = states.at(-1)?.layout as LaymanWindow;
        expect(layout.tabs.map((tab) => tab.name)).toEqual(["First"]);
    });
    expect(screen.queryByRole("button", {name: "Second"})).toBeNull();
});

test("toggles a window between maximized and restored states", async () => {
    const {states} = renderLayman({
        initialLayout: makeTiledLayout(makeTab("Main")),
        toolbarButtons: ["maximize"],
    });

    await user().click(screen.getByRole("button", {name: "Maximize window"}));
    expect(screen.getByRole("button", {name: "Restore window"})).toBeTruthy();

    await user().click(screen.getByRole("button", {name: "Restore window"}));
    expect(screen.getByRole("button", {name: "Maximize window"})).toBeTruthy();
    expect(states.at(-1)?.layout).toBeTruthy();
});

test("resizes a floating window with document mouse events", async () => {
    const floating = makeFloatingWindow("floating-main", [makeTab("Floating")]);
    const source = makeWindow(floating.tabs);
    const {states} = renderLayman({
        initialLayout: source,
        actions: [
            {
                type: "moveWindow",
                path: [],
                newPath: {floatingId: floating.id},
                window: source,
                placement: "center",
                position: floating.position,
            },
        ],
    });

    await waitFor(() => expect(states.at(-1)?.floatingWindows).toHaveLength(1));
    fireEvent.mouseDown(screen.getByLabelText("Resize floating window e"), {clientX: 360, clientY: 140});
    fireEvent.mouseMove(document, {clientX: 420, clientY: 140});
    fireEvent.mouseUp(document);

    await waitFor(() => {
        expect(states.at(-1)?.floatingWindows[0].position.width).toBe(360);
    });
});
