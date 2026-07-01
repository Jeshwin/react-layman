/**
 * Small, dependency-free utilities for deep cloning and deep equality.
 *
 * These replace the `klona` and `dequal` packages. The package only relies on
 * a narrow slice of their behavior (cloning the layout tree and comparing
 * numeric path arrays), so re-implementing them locally removes two runtime
 * dependencies and the associated npm supply-chain exposure.
 */

import {FloatingWindowAddress, WindowAddress} from "./types";

/**
 * Narrows a `WindowAddress` to a floating-window address. A `WindowAddress`
 * is either a tree `LaymanPath` (a plain number array) or a
 * `FloatingWindowAddress` (`{floatingId}`), so a simple array check
 * distinguishes the two.
 */
export function isFloatingAddress(address: WindowAddress): address is FloatingWindowAddress {
    return !Array.isArray(address);
}

/** A stable string key/DOM id for a window address, tree or floating. */
export function addressKey(address: WindowAddress): string {
    return isFloatingAddress(address) ? `float-${address.floatingId}` : address.length != 0 ? address.join(":") : "root";
}

/**
 * Recursively deep-clones a value.
 *
 * Supports the data shapes used by a layman layout: primitives, plain objects,
 * arrays, `Date`/`RegExp`, and class instances (e.g. `TabData`). Object
 * prototypes are preserved so that `instanceof` checks on cloned values keep
 * working.
 */
export function deepClone<T>(value: T): T {
    // Primitives (and functions) are returned as-is.
    if (value === null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => deepClone(item)) as unknown as T;
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as unknown as T;
    }

    if (value instanceof RegExp) {
        return new RegExp(value.source, value.flags) as unknown as T;
    }

    // Preserve the prototype so class instances stay instances.
    const cloned = Object.create(Object.getPrototypeOf(value)) as Record<string, unknown>;
    for (const key of Object.keys(value as object)) {
        cloned[key] = deepClone((value as Record<string, unknown>)[key]);
    }
    return cloned as T;
}

/**
 * Recursively compares two values for structural (deep) equality.
 *
 * Handles primitives, arrays, `Date`/`RegExp`, and plain/keyed objects.
 * `NaN` is treated as equal to itself.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    // NaN === NaN is false above; treat them as equal here.
    if (typeof a === "number" && typeof b === "number") {
        return Number.isNaN(a) && Number.isNaN(b);
    }

    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
        return false;
    }

    const aIsArray = Array.isArray(a);
    const bIsArray = Array.isArray(b);
    if (aIsArray !== bIsArray) return false;

    if (aIsArray && bIsArray) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp && b instanceof RegExp) {
        return a.source === b.source && a.flags === b.flags;
    }

    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
        if (!deepEqual(aObj[key], bObj[key])) return false;
    }
    return true;
}
