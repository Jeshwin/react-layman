import {LaymanLayout} from "./types";
import {serializeLayout, deserializeLayout} from "./Serializer";

export function loadLayout(storageKey: string | undefined, fallback: LaymanLayout): LaymanLayout {
    if (!storageKey || typeof window === "undefined") return fallback;
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw === null) return fallback;
        return deserializeLayout(JSON.parse(raw));
    } catch (err) {
        console.warn("[Layman] failed to restore layout, using initialLayout", err);
        return fallback;
    }
}

export function saveLayout(storageKey: string | undefined, layout: LaymanLayout): void {
    if (!storageKey || typeof window === "undefined") return;
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(serializeLayout(layout)));
    } catch (err) {
        console.warn("[Layman] failed to save layout", err);
    }
}
