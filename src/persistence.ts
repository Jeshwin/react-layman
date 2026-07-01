import {LaymanState} from "./types";
import {
    serializeLayout,
    deserializeLayout,
    serializeFloatingWindow,
    deserializeFloatingWindow,
} from "./Serializer";

export function loadState(storageKey: string | undefined, fallback: LaymanState): LaymanState {
    if (!storageKey || typeof window === "undefined") return fallback;
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        return {
            layout: deserializeLayout(parsed.layout),
            floatingWindows: Array.isArray(parsed.floatingWindows)
                ? parsed.floatingWindows.map(deserializeFloatingWindow)
                : [],
        };
    } catch (err) {
        console.warn("[Layman] failed to restore layout, using initialLayout", err);
        return fallback;
    }
}

export function saveState(storageKey: string | undefined, state: LaymanState): void {
    if (!storageKey || typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
            storageKey,
            JSON.stringify({
                layout: serializeLayout(state.layout),
                floatingWindows: state.floatingWindows.map(serializeFloatingWindow),
            })
        );
    } catch (err) {
        console.warn("[Layman] failed to save layout", err);
    }
}
