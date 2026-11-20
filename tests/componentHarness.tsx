/* eslint-disable react-refresh/only-export-components -- Test-only provider helpers compose local capture components. */
import {render, type RenderResult} from "@testing-library/react";
import {useContext, useEffect, useRef} from "react";
import {afterEach, beforeEach, vi} from "vitest";
import {Layman} from "../src/Layman";
import {LaymanContext, LaymanProvider} from "../src/LaymanContext";
import {TabData} from "../src/TabData";
import {
    FloatingWindowData,
    LaymanLayout,
    LaymanLayoutAction,
    LaymanState,
    LaymanWindow,
    Position,
    ToolbarButtonType,
} from "../src/types";

const viewport = {top: 0, left: 0, width: 1280, height: 720};

class TestResizeObserver {
    constructor() {}

    observe() {}

    unobserve() {}

    disconnect() {}
}

export function setupComponentTestEnvironment() {
    let uuid = 0;

    beforeEach(() => {
        uuid = 0;
        vi.useRealTimers();
        vi.stubGlobal("crypto", {randomUUID: () => `test-tab-${++uuid}`});
        vi.stubGlobal("ResizeObserver", TestResizeObserver);
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
            () => ({...viewport, x: viewport.left, y: viewport.top, right: viewport.width, bottom: viewport.height, toJSON: () => ({})}) as DOMRect
        );
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
}

export function makeTab(name: string) {
    return new TabData(name);
}

export function makeWindow(tabs: TabData[], selectedIndex = 0): LaymanWindow {
    return {tabs, selectedIndex};
}

export function makeTiledLayout(...tabs: TabData[]): LaymanLayout {
    return makeWindow(tabs);
}

export function makeFloatingWindow(
    id: string,
    tabs: TabData[],
    position: Position = {top: 40, left: 60, width: 300, height: 240}
): FloatingWindowData {
    return {id, tabs, selectedIndex: 0, position, zIndex: 1};
}

function StateCapture({onState}: {onState: (state: LaymanState) => void}) {
    const {layout, floatingWindows} = useContext(LaymanContext);

    useEffect(() => {
        onState({layout, floatingWindows});
    }, [floatingWindows, layout, onState]);

    return null;
}

function InitialActions({actions}: {actions: LaymanLayoutAction[]}) {
    const {layoutDispatch} = useContext(LaymanContext);
    const dispatched = useRef(false);

    useEffect(() => {
        if (dispatched.current) return;
        dispatched.current = true;
        actions.forEach(layoutDispatch);
    }, [actions, layoutDispatch]);

    return null;
}

interface RenderLaymanOptions {
    initialLayout?: LaymanLayout;
    mutable?: boolean;
    toolbarButtons?: ToolbarButtonType[];
    actions?: LaymanLayoutAction[];
}

export interface RenderedLayman {
    result: RenderResult;
    states: LaymanState[];
}

export function renderLayman({initialLayout, mutable = false, toolbarButtons = [], actions = []}: RenderLaymanOptions = {}): RenderedLayman {
    const states: LaymanState[] = [];
    const result = render(
        <LaymanProvider
            initialLayout={initialLayout}
            mutable={mutable}
            toolbarButtons={toolbarButtons}
            renderTab={(tab) => tab.name}
            renderPane={(tab) => <section aria-label={`${tab.name} pane`}>{tab.name} pane</section>}
            renderNull={<p>Empty layout</p>}
        >
            <StateCapture onState={(state) => states.push(state)} />
            <InitialActions actions={actions} />
            <Layman />
        </LaymanProvider>
    );

    return {result, states};
}
