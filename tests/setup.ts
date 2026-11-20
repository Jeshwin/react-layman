import {beforeEach} from "vitest";

class MemoryStorage implements Storage {
    private values = new Map<string, string>();

    get length(): number {
        return this.values.size;
    }

    clear(): void {
        this.values.clear();
    }

    getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    key(index: number): string | null {
        return [...this.values.keys()][index] ?? null;
    }

    removeItem(key: string): void {
        this.values.delete(key);
    }

    setItem(key: string, value: string): void {
        this.values.set(key, value);
    }
}

const storage = new MemoryStorage();

Object.defineProperty(window, "localStorage", {configurable: true, value: storage});
Object.defineProperty(globalThis, "localStorage", {configurable: true, value: storage});

beforeEach(() => {
    storage.clear();
});
