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

- [ ] Change `.tab-container` overflow from `scroll hidden` to `auto hidden` (`styles/global.css`)
- [ ] Hide the scrollbar visually across browsers:
    - [ ] `scrollbar-width: none` (Firefox)
    - [ ] `::-webkit-scrollbar { display: none }` (Chromium / WebKit)
    - [ ] `-ms-overflow-style: none` (legacy Edge)
- [ ] Verify the auto-scroll-to-new-tab effect still works (`WindowToolbar.tsx:54-67`)
- [ ] (Optional) Map vertical wheel → horizontal scroll for mouse-only users

---

## issues/feature/props — Controllable props (#14)

Each new prop must be wired through four spots: `LaymanProviderProps`, the
provider value, `defaultContextValue` (`LaymanContext.tsx`), and
`LaymanContextType` (`types.ts`).

### `maxDepth?: number`

- [ ] Add prop + context plumbing
- [ ] Depth convention: `depth = path.length` (a single root window = depth 0; each split +1)
- [ ] Hide split buttons in `WindowToolbar` when `path.length >= maxDepth`
- [ ] Disable edge drop placements in `WindowDropTarget` when `path.length >= maxDepth` (center always allowed)
- [ ] (Optional) hard guard in the reducer

### `showTabs?: boolean` (default `true`)

- [ ] Add prop + context plumbing
- [ ] When `false`: set effective toolbar height to `0` so the pane fills the window
      (`Window.tsx:63-68`, `WindowToolbar.tsx:148-160`, `Layman.tsx` offsets)
- [ ] Render a compact square ellipsis button as an absolute overlay in the window's top-right corner
- [ ] Clicking the ellipsis opens a popover hosting the window controls
- [ ] Popover lists tabs for selection when `tabs.length > 1` (replaces the hidden strip)
- [ ] Window dragging is disabled in this mode (drag handle lived in the toolbar)
- [ ] NOTE: the popover hosts the maximize/float buttons from the maximize-and-float
      branch — integrate at `issues/main`

### Demo-only

- [ ] Add a show/hide sidebar toggle in `demo/App.tsx` (NOT in the library)

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

- [x] A single logical control slot that swaps maximize↔minimize and float↔unfloat
      based on state (rather than separate static entries)

### Progress Prompt

For this branch's float feature, we need to make a few changes. First, the floating window and toolbar should not be so different from the regular window panes and toolbars, currently they have their own style and layout, and don't look like regular window that float! Instead, re-use as much as possible from the existing Window, WindowTabs, and WindowToolbar components in the floating windows. Secondly, when floating windows are dragged, there should be 5 types of "anchor" zones that should appear. The first 4 anchor zones are on each of the 4 sides of the complete Layman instance, top bottom left and right. These zones will be 100x200 pixels, of course rotated so top and bottom zones are 200 wide, while left and right zones are 100 wide and 200 high. The fifth anchor zone is one PER window in the layout! It is a single zone that appears on the window that the CURSOR is currently on top of! This zone will be in the middle of the window, and will be 200x200, or the dimensions of the window, whichever is smallest. For any of these zones, if the floating window being dragged is dropped on any of these zones, then the window should go back into the layout at the specified zone. So, if the floating window is dragged onto the top anchor zone, then it should be added to the vertical top of the layout, making a split only if necessary! If dragged onto the fifth per-window zone, the tabs from the floating window get added into that layout window's tabs. Finally, make sure that the tabs within a window aren't destroyed and re-created when they are floated! That is the current implementation, which is not the desired behavior! The tabs within the floating window should be the same tabs as in the window before it was floated, preserving their current state! Think carefully about how to implement the floating windows feature to make sure that this condition holds!

---

## Cross-cutting

- [x] Keep `package.json`'s `test` script as `vitest run` so the CI publish gate stays real.
