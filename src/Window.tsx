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
                    overflow: "hidden",
                    margin: `${separatorThickness / 2}px`,
                    marginTop: 0,
                    borderRadius: 4,
                    backgroundColor: "#27272a",
                    visibility: selectedTabs.includes(tab)
                        ? "visible"
                        : "hidden",
                }}
            >
                {renderPane(tab)}
            </div>
        </>
    );
}
