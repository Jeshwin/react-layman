import {useAtomValue} from "jotai";
import {separatorThickness, windowToolbarHeight} from "./constants";
import {Inset} from "./Inset";
import {nexusRefAtom, renderPaneAtom, selectedTabsAtom} from "./Nexus";
import {NexusKey} from "./types";

export default function Window({inset, tab}: {inset: Inset; tab: NexusKey}) {
    const renderPane = useAtomValue(renderPaneAtom).fn;
    const nexusRef = useAtomValue(nexusRefAtom);
    const selectedTabs = useAtomValue(selectedTabsAtom);

    const adjustedInset = new Inset({
        ...inset,
        top:
            inset.top +
            (nexusRef
                ? (100 * windowToolbarHeight) /
                  nexusRef.current!.getBoundingClientRect().height
                : 0),
    });

    return (
        <>
            <div
                id={tab}
                style={{
                    inset: adjustedInset.toString(),
                    position: "absolute",
                    margin: `${separatorThickness / 2}px`,
                    marginTop: 0,
                }}
                className={`rounded bg-zinc-800 overflow-hidden ${
                    selectedTabs.includes(tab) ? "visible" : "invisible"
                }`}
            >
                {renderPane(tab)}
            </div>
        </>
    );
}
