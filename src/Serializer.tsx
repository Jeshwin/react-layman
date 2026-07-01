import {
    FloatingWindowData,
    LaymanLayout,
    LaymanSerializedFloatingWindow,
    LaymanSerializedLayout,
    LaymanSerializedTab,
    TabData,
} from "./types";

export function serializeLayout(layout: LaymanLayout): LaymanSerializedLayout {
    if (!layout) return null;
    if ("tabs" in layout) {
        return {
            kind: "window",
            selectedIndex: layout.selectedIndex ?? 0,
            viewPercent: layout.viewPercent,
            tabs: layout.tabs.map((t) => ({name: t.name, options: t.options})),
        };
    }
    return {
        kind: "node",
        direction: layout.direction,
        viewPercent: layout.viewPercent,
        children: layout.children.map(serializeLayout),
    };
}

// Reconstruct a TabData from serialized form, injecting the correct icon
export function deserializeTab({name, options}: LaymanSerializedTab): TabData {
    return new TabData(name, {...options});
}

export function deserializeLayout(data: LaymanSerializedLayout): LaymanLayout {
    if (!data) return undefined;
    if (data.kind === "window") {
        return {
            tabs: data.tabs.map(deserializeTab),
            selectedIndex: data.selectedIndex,
            viewPercent: data.viewPercent,
        };
    }
    return {
        direction: data.direction,
        viewPercent: data.viewPercent,
        children: data.children.map(deserializeLayout) as [LaymanLayout, LaymanLayout, ...LaymanLayout[]],
    };
}

export function serializeFloatingWindow(floatingWindow: FloatingWindowData): LaymanSerializedFloatingWindow {
    return {
        id: floatingWindow.id,
        selectedIndex: floatingWindow.selectedIndex,
        position: floatingWindow.position,
        zIndex: floatingWindow.zIndex,
        tabs: floatingWindow.tabs.map((t) => ({name: t.name, options: t.options})),
    };
}

export function deserializeFloatingWindow(data: LaymanSerializedFloatingWindow): FloatingWindowData {
    return {
        id: data.id,
        selectedIndex: data.selectedIndex,
        position: data.position,
        zIndex: data.zIndex,
        tabs: data.tabs.map(deserializeTab),
    };
}
