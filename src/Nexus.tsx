import {RefObject, useEffect, useMemo, useRef, useState} from "react";
import {atom, useAtom, useSetAtom} from "jotai";
import WindowToolbar from "./WindowToolbar";
import Window from "./Window";
import Separator from "./Separator";
import {Inset} from "./Inset";
import {
    NexusDirection,
    NexusKey,
    NexusKeys,
    NexusLayout,
    NexusPath,
    PaneRenderer,
    TabRenderer,
} from "./types";
import {atomWithStorage} from "jotai/utils";

// Jotai atoms to store global layout state
export const nexusRefAtom = atom<RefObject<HTMLDivElement> | null>(null);
export const layoutAtom = atomWithStorage<NexusLayout>("nexusLayout", []);
export const tabsAtom = atom<NexusKeys>([]);
export const selectedTabsAtom = atom<NexusKeys>([]);

// Complicated way to use atoms to store functions :(
// See this => https://stackoverflow.com/questions/73449599/storing-function-as-jotai-atom
const derivedRenderPaneAtom = atom<{
    fn: PaneRenderer;
}>({fn: () => <></>});
export const renderPaneAtom = atom(
    (get) => get(derivedRenderPaneAtom),
    (_get, set, newFn: PaneRenderer) => {
        set(derivedRenderPaneAtom, {fn: newFn});
    }
);

const derivedRenderTabAtom = atom<{
    fn: TabRenderer;
}>({fn: () => <></>});
export const renderTabAtom = atom(
    (get) => get(derivedRenderTabAtom),
    (_get, set, newFn: TabRenderer) => {
        set(derivedRenderTabAtom, {fn: newFn});
    }
);

// Entry point for Nexus Window Manager
// Takes in an initial layout as a binary tree object
// Uses two function to render the layout; one to convert a unique id to a pane,
// and one to convert the same unique id to a tab name/component
// Stores useful global state using Jotai atoms
export default function Nexus({
    initialLayout,
    renderPane,
    renderTab,
}: {
    initialLayout: NexusLayout;
    renderPane: (arg0: string) => JSX.Element;
    renderTab: (arg0: string) => string | JSX.Element;
}) {
    // Reference for parent div
    const nexusRef = useRef(null);
    const setNexusRef = useSetAtom(nexusRefAtom);

    // Set all atoms based on props
    const [layout, setLayout] = useAtom(layoutAtom);
    const setRenderPane = useSetAtom(renderPaneAtom);
    const setRenderTab = useSetAtom(renderTabAtom);
    const setTabs = useSetAtom(tabsAtom);

    // Use effects to set initial values for atoms
    useEffect(() => {
        setNexusRef(nexusRef);
    }, [setNexusRef]);

    useEffect(() => {
        setLayout(initialLayout);
    }, [initialLayout, setLayout]);

    useEffect(() => {
        setRenderPane(renderPane);
    }, [renderPane, setRenderPane]);

    useEffect(() => {
        setRenderTab(renderTab);
    }, [renderTab, setRenderTab]);

    // Get all tab ids from initial layout
    useEffect(() => {
        const tabs: NexusKeys = [];

        const traverseLayout = (layout: NexusLayout) => {
            if (Array.isArray(layout)) {
                layout.forEach((tab) => tabs.push(tab));
            } else {
                traverseLayout(layout!.first);
                traverseLayout(layout!.second);
            }
        };
        traverseLayout(layout);

        setTabs(tabs);
    }, [layout, setTabs]);

    // Local state for component lists
    type SeparatorProps = {
        key: string;
        parentInset: Inset;
        splitPercentage: number;
        direction: NexusDirection;
        path: NexusPath;
    };
    type ToolBarProps = {
        key: string;
        inset: Inset;
        path: NexusPath;
        tabs: NexusKeys;
    };
    type PaneProps = {inset: Inset; tab: NexusKey};

    const [separators, setSeparators] = useState<SeparatorProps[]>([]);
    const [toolbars, setToolbars] = useState<ToolBarProps[]>([]);
    const [panes, setPanes] = useState<PaneProps[]>([]);

    // Calculate component lists whenever layout changes
    // useMemo caches values if they don't change
    useMemo(() => {
        const calculatedSeparators: SeparatorProps[] = [];
        const calculatedToolbars: ToolBarProps[] = [];
        const calculatedPanes: PaneProps[] = [];

        function traverseLayout(
            layout: NexusLayout,
            inset: Inset,
            path: NexusPath
        ) {
            if (Array.isArray(layout)) {
                calculatedToolbars.push({
                    key: path.join(":"),
                    inset,
                    path,
                    tabs: layout,
                });
                layout.map((tab) =>
                    calculatedPanes.push({
                        inset,
                        tab: tab as NexusKey,
                    })
                );
            } else {
                if (!layout) return;
                calculatedSeparators.push({
                    key: path.length != 0 ? path.join(":") : "root",
                    parentInset: inset,
                    splitPercentage: layout.splitPercentage ?? 50,
                    direction: layout.direction,
                    path,
                });
                const {firstInset, secondInset} = inset.newInsets(
                    layout.splitPercentage ?? 50,
                    layout.direction
                );
                traverseLayout(
                    layout.first,
                    firstInset,
                    path.concat(["first"])
                );
                traverseLayout(
                    layout.second,
                    secondInset,
                    path.concat(["second"])
                );
            }
        }

        traverseLayout(layout, new Inset({}), []);
        setSeparators(calculatedSeparators);
        setToolbars(calculatedToolbars);
        setPanes(calculatedPanes);
    }, [layout]);

    return (
        <div
            ref={nexusRef}
            style={{
                overflow: "hidden",
                position: "relative",
                width: "100%",
                height: "100%",
            }}
        >
            {separators.map((props) => (
                <Separator
                    key={props.key}
                    parentInset={props.parentInset}
                    splitPercentage={props.splitPercentage}
                    direction={props.direction}
                    path={props.path}
                />
            ))}
            {toolbars.map((props) => (
                <WindowToolbar
                    key={props.key}
                    inset={props.inset}
                    path={props.path}
                    tabs={props.tabs}
                />
            ))}
            {panes.map((props) => (
                <Window key={props.tab} inset={props.inset} tab={props.tab} />
            ))}
        </div>
    );
}
