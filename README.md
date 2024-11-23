# react-layman

<div align="center">
    
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub commit activity](https://img.shields.io/github/commit-activity/t/Jeshwin/react-layman)](https://github.com/Jeshwin/react-layman)
[![GitHub Repo stars](https://img.shields.io/github/stars/Jeshwin/react-layman)](https://github.com/Jeshwin/react-layman)
[![GitHub issues](https://img.shields.io/github/issues/Jeshwin/react-layman)](https://github.com/Jeshwin/react-layman/issues)
![NPM Version](https://img.shields.io/npm/v/react-layman)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

## About <a name = "about"></a>

React Layman is a fully-featured, dynamic layout manager made for React. It is written in Typescript and provides typing, but may also be used with regular Javascript. Layman is inspired by [Replit](https://replit.com)'s IDE, [LeetCode](https://leetcode.com)'s new UI, and the pre-existing [React Mosaic](https://github.com/nomcopter/react-mosaic) project.

You can play around with Layman through [this demo](https://jeshwin.github.io/react-layman).

## Progress

-   [x] Dynamic Layout
    -   [x] Rows and columns
    -   [x] Adjustable windows
    -   [x] Drag and drop windows
    -   [x] Delete windows
    -   [x] Tabbed windows
        -   [x] Draggable tabs
-   [x] Extra features
    -   [x] Auto Arrange
    -   [x] "Add to corner" hueristic
    -   [x] Add tabs from sources external to layout

## Usage

To use Layman, add the `LaymanProvider` component, which sets up your initial layout, rendering functions, and other configurations. Add the `Layman` component within the provider to render out the layout. `<Layman />` can be deeply nested within `LaymanProvider`. Also note, `<Layman />`'s parent needs to have a defined width and height, since it's dimensions are relative to it.

```tsx
<LaymanProvider initialLayout={initialLayout} renderPane={renderPane} renderTab={renderTab} renderNull={<NullLayout />}>
    <div>
        <div>
            <div style={{width: 1200, height: 900}}>
                <Layman />
            </div>
        </div>
    </div>
</LaymanProvider>
```

### Installation

To install and run Layman locally, run the following commands in your terminal. This will clone this repository, install all necessary packages, and run the demo page at `localhost:5173/react-layman`

```bash
git clone https://github.com/Jeshwin/react-layman.git
cd react-layman
npm install
npm run dev
```

### Themes

You can use the default theme in `src/styles/theme.css`, or define your own themes with CSS variables like this:

```css
:root {
    /*** Separators ***/
    /* Color of the handle on the separator */
    --separator-handle-color: #c6d0f5;

    /* Thickness of the separator between windows */
    --separator-thickness: 4px;

    /* Length of the separator handle */
    --separator-handle-length: 16px;

    /*** Windows ***/
    /* Background color of the window */
    --window-bg-color: #303446;

    /* Border radius for window corners */
    --border-radius: 8px;

    /*** Window Toolbars ***/
    /* Background color of the toolbar */
    --toolbar-bg-color: #292c3c;

    /* Background color of the toolbar on hover */
    --toolbar-hover-bg-color: #414559;

    /* Background color for toolbar buttons on hover */
    --toolbar-button-hover-bg-color: #414559;

    /* Height of the toolbar at the top of each window */
    --toolbar-height: 32px;

    /*** Tabs ***/
    /* Text color of tab titles */
    --tab-text-color: #c6d0f5;

    /* Color of the 'close' icon in tabs, with opacity */
    --close-tab-color: #e7828488;

    /* Color of indicators (e.g., focus indicator) */
    --indicator-color: #a6d189;

    /* Thickness of indicators (e.g., focus indicator) */
    --indicator-thickness: 1px;

    /* Font size for text in tabs */
    --tab-font-size: 14px;
}
```

Then, you can import this theme at the root of your project. Note, you must still import the global CSS file, since this is required for Layman to work properly.

```tsx
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

// Import a custom theme
import "./custom_theme.css";
// Or import the default theme
import "../src/styles/theme.css";
// You must still import the global CSS settings
import "../src/styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

## API

### Type Definitions

Please see [types.ts](src/types.ts) for the full details.

#### Common Types

```ts
export interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

import {v4 as uuidv4} from "uuid";

interface TabOptions {
    [key: string]: unknown; // Allows any custom data
}

export class TabData {
    // private UUID representing the tab
    id: string;

    // Is the tab currently selected in a window?
    isSelected: boolean;

    // Display name of tab
    public name: string;

    // Optional data attached to each tab
    public options: TabOptions;

    /** Creates an instance of the TabData class. */
    constructor(name: string, options: TabOptions = {}) {
        this.id = uuidv4();
        this.isSelected = false;
        this.name = name;
        this.options = options;
    }
}
```

#### LaymanLayout

```ts
// Credit: https://blog.replit.com/leaky-uis
// This is a utility type, a dynamically sized tuple
// that requires at least 2 elements be present. This
// guarantees flatness, i.e. no awkward [[[[A]]]] case
export type Children<T> = [T, T, ...T[]];

export type LaymanDirection = "column" | "row";
export type LaymanPath = Array<number>;

export interface LaymanWindow {
    viewPercent?: number;
    tabs: TabData[];
    selectedIndex?: number;
}

export interface LaymanNode {
    direction: LaymanDirection;
    viewPercent?: number;
    children: Children<LaymanLayout>;
}

export type LaymanLayout = LaymanWindow | LaymanNode | undefined;
```

#### Dragged Tabs/Windows

```ts
export const TabType = "TAB";
export const WindowType = "WINDOW";

interface DragTab {
    tab: TabData;
    path?: LaymanPath;
}

interface DragWindow {
    tabs: TabData[];
    path: LaymanPath;
    selectedIndex: number;
}

export type DragData = DragTab | DragWindow;
```

#### LaymanProvider Props

```ts
type LaymanProviderProps = {
    initialLayout: LaymanLayout;
    renderPane: (tab: TabData) => JSX.Element;
    renderTab: (tab: TabData) => JSX.Element;
    renderNull: JSX.Element;
};
```

#### LaymanProvider Context Data

```ts
export type PaneRenderer = (arg0: TabData) => JSX.Element;
export type TabRenderer = (arg0: TabData) => string | JSX.Element;

export interface LaymanContextType {
    globalContainerSize: Position;
    setGlobalContainerSize: Dispatch<SetStateAction<Position>>;
    layout: LaymanLayout;
    layoutDispatch: React.Dispatch<LaymanLayoutAction>;
    setDropHighlightPosition: React.Dispatch<Position>;
    globalDragging: boolean;
    setGlobalDragging: React.Dispatch<boolean>;
    draggedWindowTabs: TabData[];
    setDraggedWindowTabs: React.Dispatch<TabData[]>;
    windowDragStartPosition: {x: number; y: number};
    setWindowDragStartPosition: React.Dispatch<{x: number; y: number}>;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    renderNull: JSX.Element;
}
```

### Dispatch Options

Updates to the layout are handled through a [React Reducer](https://react.dev/learn/scaling-up-with-reducer-and-context) with the function `layoutDispatch`. Here are the following actions that you can use for controlling changes to the layout

#### Add Tab

```ts
layoutDispatch({
    type: "addTab",
    tab: TabData,
    path: LaymanPath, // Path of the window to add the tab to
});
```

#### Remove Tab

```ts
layoutDispatch({
    type: "removeTab",
    tab: TabData,
    path: LaymanPath, // Path of the window to remove the tab from
});
```

If the tab does not exist in the path, no changes will be made to the layout.

#### Select Tab

```ts
layoutDispatch({
    type: "selectTab",
    tab: TabData,
    path: LaymanPath, // Path of the window to select the tab from
});
```

If the tab does not exist in the path, no changes will be made to the layout.

#### Move Tab

```ts
layoutDispatch({
    type: "moveTab",
    tab: TabData,
    path: LaymanPath, // Original path of the tab
    newPath: LaymanPath, // New path for the tab
    placement: "top" | "bottom" | "left" | "right" | "center",
});
```

If the tab does not exist in the original path, no changes will be made to the layout.

#### Move Separator

```ts
layoutDispatch({
    type: "moveSeparator",
    path: LaymanPath, // Path of the node that the separator is located in
    index: number, // Index of the separator within the node
    newSplitPercentage: number, // Updated split percentage for the layout left of the separator
});
```

#### Add Window

```ts
layoutDispatch({
    type: "addWindow",
    window: LaymanWindow,
    path: LaymanPath, // Path of the window to add next to
    placement: "top" | "bottom" | "left" | "right",
});
```

#### Remove Window

```ts
layoutDispatch({
    type: "removeWindow",
    path: LaymanPath, // Path of the window to remove
});
```

#### Move Window

```ts
layoutDispatch({
    type: "moveWindow",
    window: LaymanWindow,
    path: LaymanPath, // Original path of the window
    newPath: LaymanPath, // New path of the window
    placement: "top" | "bottom" | "left" | "right" | "center",
});
```

#### Add Tab With Heuristic

```ts
layoutDispatch({
    type: "addTabWithHeuristic";
    heuristic: "topleft" | "topright";
    tab: TabData;
})
```

#### Auto Arrange Layout

```ts
layoutDispatch({
    type: "autoArrange",
});
```

## Examples

See the [demo](https://jeshwin.github.io/react-layman) for a full example of Laymans' current features!

### External Tab Source

This is the code for the tab sources in the demo, which support dragging into the layout to create a new tab, or adding using a specified heuristic

```tsx
export default function TabSource({tabName, heuristic}: {tabName: string; heuristic: LaymanHeuristic}) {
    const {setGlobalDragging, layoutDispatch} = useContext(LaymanContext);

    const [{isDragging}, drag] = useDrag({
        type: TabType,
        item: {
            path: undefined,
            tab: new TabData(tabName),
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    useEffect(() => {
        setGlobalDragging(isDragging);
    }, [isDragging, setGlobalDragging]);

    const handleDoubleClick = () => {
        // Add tab to the top left window
        layoutDispatch({
            type: "addTabWithHeuristic",
            tab: new TabData(tabName),
            heuristic: heuristic,
        });
    };

    return (
        <div
            ref={drag}
            className="tab-source"
            style={{
                width: 48,
                height: 48,
                display: "grid",
                placeContent: "center",
                textAlign: "center",
                borderRadius: 8,
                backgroundColor: "#babbf1",
                margin: 4,
                opacity: isDragging ? 0.5 : 1,
                cursor: "pointer",
            }}
            onDoubleClick={handleDoubleClick}
        >
            {tabName}
        </div>
    );
}
```

## License

This repository is published under the [MIT license](/LICENSE)
