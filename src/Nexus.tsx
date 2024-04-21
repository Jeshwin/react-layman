import {RefObject, useEffect, useRef} from "react";
import {atom, useAtom, useSetAtom} from "jotai";
import WindowToolbar from "./WindowToolbar";
import Window from "./Window";
import Separator from "./Separator";
import {Inset} from "./Inset";
import {NexusKey, NexusKeys, NexusLayout, NexusPath} from "./types";

// Jotai atoms to store global layout state
export const nexusRefAtom = atom<RefObject<HTMLDivElement> | null>(null);
export const layoutAtom = atom<NexusLayout>([]);
export const tabsAtom = atom<NexusKeys>([]);
export const selectedTabsAtom = atom<NexusKeys>([]);

// Complicated way to use atoms to store functions :(
const derivedRenderPaneAtom = atom<{
    fn: (arg0: NexusKey) => JSX.Element;
}>({fn: () => <></>});
export const renderPaneAtom = atom(
    (get) => get(derivedRenderPaneAtom),
    (_get, set, newFn: (arg0: NexusKey) => JSX.Element) => {
        set(derivedRenderPaneAtom, {fn: newFn});
    }
);

const derivedRenderTabAtom = atom<{
    fn: (arg0: NexusKey) => string | JSX.Element;
}>({fn: () => <></>});
export const renderTabAtom = atom(
    (get) => get(derivedRenderTabAtom),
    (_get, set, newFn: (arg0: NexusKey) => string | JSX.Element) => {
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

    // Flattens binary tree layout into three arrays
    // First array => separators
    // Second array => window toolbars
    // Third array => panes
    const renderLayout = (layout: NexusLayout) => {
        const separators: JSX.Element[] = [];
        const toolbars: JSX.Element[] = [];
        const panes: JSX.Element[] = [];

        function traverseLayout(
            layout: NexusLayout,
            inset: Inset,
            path: NexusPath
        ) {
            if (Array.isArray(layout)) {
                toolbars.push(
                    <WindowToolbar
                        key={path.join(":")}
                        inset={inset}
                        path={path}
                        tabs={layout}
                    />
                );
                layout.map((tab) =>
                    panes.push(
                        <Window
                            key={path.join(":") + ":" + tab}
                            inset={inset}
                            tab={tab}
                        />
                    )
                );
            } else {
                if (!layout) return;
                separators.push(
                    <Separator
                        key={path.length != 0 ? path.join(":") : "root"}
                        parentInset={inset}
                        splitPercentage={layout.splitPercentage ?? 50}
                        direction={layout.direction}
                        path={path}
                    />
                );
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
        return [separators, toolbars, panes];
    };

    return (
        <div ref={nexusRef} className="w-full h-full relative overflow-hidden">
            {renderLayout(layout)}
        </div>
    );
}
