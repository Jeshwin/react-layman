# React Layman — Issues TODO

Tracking work for GitHub issues [#12](https://github.com/Jeshwin/react-layman/issues/12)
and [#14](https://github.com/Jeshwin/react-layman/issues/14), plus new
maximize/minimize and float/unfloat window controls.

## Branch structure

- `issues/main` — this TODO + integration branch
    - `issues/bugfix/scrollbars` — Issue #12 (tab bar scrollbar)
    - `issues/feature/props` — Issue #14 (subset: maxDepth, showTabs)
    - `issues/feature/maximize-and-float` — new window toolbar controls

---

## issues/bugfix/scrollbars — Tab bar scrollbar (#12)

The tab strip (`.tab-container`) uses `overflow: scroll hidden`, which forces a
horizontal scrollbar to always render and, on some OS/browsers, paints it over
the tabs.

- [x] Change `.tab-container` overflow from `scroll hidden` to `auto hidden` (`styles/global.css`)
- [x] Hide the scrollbar visually across browsers:
    - [x] `scrollbar-width: none` (Firefox)
    - [x] `::-webkit-scrollbar { display: none }` (Chromium / WebKit)
    - [x] `-ms-overflow-style: none` (legacy Edge)
- [x] Verify the auto-scroll-to-new-tab effect still works (`WindowToolbar.tsx:54-67`)
- [x] (Optional) Map vertical wheel → horizontal scroll for mouse-only users

---

## issues/feature/props — Controllable props (#14)

Each new prop must be wired through four spots: `LaymanProviderProps`, the
provider value, `defaultContextValue` (`LaymanContext.tsx`), and
`LaymanContextType` (`types.ts`).

### `maxDepth?: number`

- [x] Add prop + context plumbing
- [x] Depth convention: `depth = path.length` (a single root window = depth 0; each split +1)
- [x] Hide split buttons in `WindowToolbar` when `path.length >= maxDepth`
- [x] Disable edge drop placements in `WindowDropTarget` when `path.length >= maxDepth` (center always allowed)
- [ ] (Optional) hard guard in the reducer

### `showTabs?: boolean` (default `true`)

- [x] Add prop + context plumbing
- [x] When `false`: set effective toolbar height to `0` so the pane fills the window
      (`Window.tsx:63-68`, `WindowToolbar.tsx:148-160`, `Layman.tsx` offsets)
- [x] Render a compact square ellipsis button as an absolute overlay in the window's top-right corner
- [x] Clicking the ellipsis opens a popover hosting the window controls
- [x] Popover lists tabs for selection when `tabs.length > 1` (replaces the hidden strip)
- [x] Window dragging is disabled in this mode (drag handle lived in the toolbar)
- [ ] NOTE: the popover hosts the maximize/float buttons from the maximize-and-float
      branch — integrate at `issues/main`

### Demo-only

- [x] Add a show/hide sidebar toggle in `demo/App.tsx` (NOT in the library)

### Out of scope

- max/min window sizes — not feasible with the current geometry model; deferred.

---

## issues/feature/maximize-and-float — Window controls

Maximize/float state is **ephemeral** (not persisted to localStorage). New
context state + setters: `maximizedPath`, `floatingWindows`, focus order.

### Maximize / Minimize

- [x] Add context state `maximizedPath: LaymanPath | null`
- [x] `maximize` button → set `maximizedPath = path` (replace placeholder `WindowToolbar.tsx:240-245`)
- [x] In `Layman.tsx`, override the matching toolbar + window `Position` to the full
      container with elevated z-index (~20); keep all other windows at their normal positions
- [x] Button swaps to minimize when `deepEqual(path, maximizedPath)`; minimize clears
      it (replace placeholder `WindowToolbar.tsx:246-251`)

### Float / Unfloat

- [x] Add `FloatIcon` / `UnfloatIcon` to `Icons.tsx`
- [x] Add `"float"` to `ToolbarButtonType` (`types.ts:150-158`)
- [x] Context state `floatingWindows: Array<{id, tabs, selectedIndex, position, zIndex}>`
- [x] Float button → dispatch `removeWindow(path)` + push a floating entry using the
      window's computed size at float time
- [x] New `FloatingWindow` component: drag via topbar, resize via edges/corners,
      click-to-focus raises z-index
- [x] Render the floating layer (near `DropHighlight` in `LaymanContext`)
- [x] Unfloat → hit-test the float's center against computed window positions → move
      all tabs into that layout window; remove the floating entry
- [x] Decision: floating a maximized window un-maximizes first
- [x] Decision: unfloat fallback when the center is over no window

### Button model

- [x] A single logical control slot that swaps maximize<->minimize and float<->unfloat
      based on state (rather than separate static entries)

---

## Cross-cutting

- [x] Keep `package.json`'s `test` script as `vitest run` so the CI publish gate stays real.
