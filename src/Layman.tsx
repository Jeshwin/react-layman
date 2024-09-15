import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {WindowToolbar} from "./WindowToolbar";
import {Window} from "./Window";
import {Separator} from "./Separator";
import {Inset} from "./Inset";
import {
    LaymanLayout,
    LaymanPath,
    SeparatorProps,
    ToolBarProps,
    PaneProps,
} from "./types";
import {LaymanContext} from "./LaymanContext";

// Entry point for Layman Window Manager
// Takes in an initial layout as a binary tree object
// Uses two function to render the layout; one to convert a unique id to a pane,
// and one to convert the same unique id to a tab name/component
// Stores useful global state using Jotai atoms
export function Layman() {
    const {setLaymanRef, layout} = useContext(LaymanContext);
    // Local state for component lists
    const [separators, setSeparators] = useState<SeparatorProps[]>([]);
    const [toolbars, setToolbars] = useState<ToolBarProps[]>([]);
    const [panes, setPanes] = useState<PaneProps[]>([]);
    // Reference for parent div
    const laymanRef = useRef(null);

    useEffect(() => {
        setLaymanRef(laymanRef);
    });

    // Calculate component lists whenever layout changes
    // useMemo caches values if they don't change
    useMemo(() => {
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
                    inset,
                    path,
                    tabs: layout,
                });
                layout.map((tab) =>
                    calculatedPanes.push({
                        inset,
                        tab: tab,
                    })
                );
            } else {
                if (!layout) return;
                calculatedSeparators.push({
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

        traverseLayout(
            layout,
            new Inset({top: 0, left: 0, bottom: 0, right: 0}),
            []
        );
        setSeparators(calculatedSeparators);
        setToolbars(calculatedToolbars);
        setPanes(calculatedPanes);
    }, [layout]);

    return (
        <div ref={laymanRef} className="layman-root">
            {separators.map((props) => (
                <Separator
                    key={props.path.length != 0 ? props.path.join(":") : "root"}
                    parentInset={props.parentInset}
                    splitPercentage={props.splitPercentage}
                    direction={props.direction}
                    path={props.path}
                />
            ))}
            {toolbars.map((props) => (
                <WindowToolbar
                    key={props.path.length != 0 ? props.path.join(":") : "root"}
                    inset={props.inset}
                    path={props.path}
                    tabs={props.tabs}
                />
            ))}
            {panes.map((props) => (
                <Window
                    key={props.tab.id}
                    inset={props.inset}
                    tab={props.tab}
                />
            ))}
        </div>
    );
}
