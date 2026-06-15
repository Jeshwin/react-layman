// @ts-check
/**
 * auto-version-publish.mjs
 *
 * Verifies that the package version in package.json is greater than the version
 * currently published on the npm registry. If it is, nothing is changed (this
 * respects manual minor/major bumps performed by a human). If it is NOT greater
 * (i.e. the version was not increased before merging), this script automatically
 * bumps ONLY the rightmost number (the patch), computed from the published
 * baseline so it can never collide with an existing release.
 *
 *   e.g. published 0.2.15, local 0.2.15  ->  rewrites local to 0.2.16
 *        published 0.2.15, local 0.3.0   ->  left untouched (human bump allowed)
 *
 * It intentionally does NOT run `npm publish` itself; the CI workflow performs
 * the provenance-enabled publish step after this script has settled the version.
 *
 * Run with: `node scripts/auto-version-publish.mjs`
 * No external dependencies. Exits non-zero on unexpected failure.
 */

import {execFileSync} from "node:child_process";
import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const packageJsonPath = fileURLToPath(new URL("../package.json", import.meta.url));

/**
 * Parse a plain "major.minor.patch" semver string into numbers.
 * @param {string} version
 * @returns {{major: number, minor: number, patch: number}}
 */
function parseVersion(version) {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());
    if (!match) {
        throw new Error(`Unsupported version format: "${version}" (expected major.minor.patch)`);
    }
    return {major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3])};
}

/**
 * Returns true when `a` is strictly greater than `b` (semver order).
 * @param {{major: number, minor: number, patch: number}} a
 * @param {{major: number, minor: number, patch: number}} b
 */
function isGreater(a, b) {
    if (a.major !== b.major) return a.major > b.major;
    if (a.minor !== b.minor) return a.minor > b.minor;
    return a.patch > b.patch;
}

/**
 * Read the version currently published on the npm registry.
 * Returns null when the package has never been published.
 * @param {string} name
 * @returns {string | null}
 */
function getPublishedVersion(name) {
    try {
        const out = execFileSync("npm", ["view", name, "version"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        });
        const trimmed = out.trim();
        return trimmed.length > 0 ? trimmed : null;
    } catch (error) {
        // `npm view` exits non-zero (E404) when the package does not exist yet.
        const message = error && typeof error === "object" && "stderr" in error ? String(error.stderr) : String(error);
        if (/E404|404 Not Found|is not in this registry|code E404/i.test(message)) {
            return null;
        }
        throw new Error(`Failed to query npm for "${name}" version:\n${message}`);
    }
}

function main() {
    const raw = readFileSync(packageJsonPath, "utf8");
    const pkg = JSON.parse(raw);
    const name = pkg.name;
    const localVersionString = pkg.version;

    if (!name || !localVersionString) {
        throw new Error("package.json is missing a name or version field.");
    }

    const local = parseVersion(localVersionString);
    const publishedVersionString = getPublishedVersion(name);

    if (publishedVersionString === null) {
        console.log(`[auto-version] "${name}" has no published version yet. Publishing ${localVersionString} as-is.`);
        return;
    }

    const published = parseVersion(publishedVersionString);

    if (isGreater(local, published)) {
        console.log(
            `[auto-version] Local version ${localVersionString} is greater than published ${publishedVersionString}. No change needed.`
        );
        return;
    }

    // Not increased: bump ONLY the rightmost digit, based on the published baseline.
    const bumped = `${published.major}.${published.minor}.${published.patch + 1}`;
    pkg.version = bumped;

    // Preserve 4-space indentation and trailing newline to match repo style.
    writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 4)}\n`, "utf8");

    console.log(
        `[auto-version] Local version ${localVersionString} was not greater than published ${publishedVersionString}. ` +
            `Auto-bumped patch to ${bumped}.`
    );
}

try {
    main();
} catch (error) {
    console.error(`[auto-version] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}
