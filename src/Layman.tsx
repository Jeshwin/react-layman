import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {WindowToolbar} from "./WindowToolbar";
import {Window} from "./Window";
import {Separator} from "./Separator";
import {Inset} from "./Inset";
import {
    LaymanDirection,
    LaymanKey,
    LaymanKeys,
    LaymanLayout,
    LaymanPath,
} from "./types";
import {LaymanContext} from "./LaymanContext";

// Types for local state arrays
type SeparatorProps = {
    key: string;
    parentInset: Inset;
    splitPercentage: number;
    direction: LaymanDirection;
    path: LaymanPath;
};
type ToolBarProps = {
    key: string;
    inset: Inset;
    path: LaymanPath;
    tabs: LaymanKeys;
};
type PaneProps = {inset: Inset; tab: LaymanKey};

// Entry point for Layman Window Manager
// Takes in an initial layout as a binary tree object
// Uses two function to render the layout; one to convert a unique id to a pane,
// and one to convert the same unique id to a tab name/component
// Stores useful global state using Jotai atoms
export function Layman() {
    const laymanContext = useContext(LaymanContext);
    // Local state for component lists
    const [separators, setSeparators] = useState<SeparatorProps[]>([]);
    const [toolbars, setToolbars] = useState<ToolBarProps[]>([]);
    const [panes, setPanes] = useState<PaneProps[]>([]);
    // Reference for parent div
    const laymanRef = useRef(null);

    useEffect(() => {
        laymanContext!.setLaymanRef(laymanRef);
    });

    // Calculate component lists whenever layout changes
    // useMemo caches values if they don't change
    useMemo(() => {
        const layout = laymanContext!.layout;
        const calculatedSeparators: SeparatorProps[] = [];
        const calculatedToolbars: ToolBarProps[] = [];
        const calculatedPanes: PaneProps[] = [];

        function traverseLayout(
            layout: LaymanLayout,
            inset: Inset,
            path: LaymanPath
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
                        tab: tab as LaymanKey,
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
    }, [laymanContext]);

    return (
        <div ref={laymanRef} className="layman-root">
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
