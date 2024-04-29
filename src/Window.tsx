import {windowToolbarHeight} from "./constants";
import {Inset} from "./Inset";
import {NexusKey} from "./types";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";

export default function Window({inset, tab}: {inset: Inset; tab: NexusKey}) {
    const laymanContext = useContext(LaymanContext);

    const adjustedInset = new Inset({
        ...inset,
        top:
            inset.top +
            (laymanContext!.laymanRef
                ? (100 * windowToolbarHeight) /
                  laymanContext!.laymanRef.current!.getBoundingClientRect()
                      .height
                : 0),
    });

    return (
        <>
            <div
                id={tab}
                style={{
                    inset: adjustedInset.toString(),
                }}
                className={`nexus-window ${
                    laymanContext!.selectedTabs.includes(tab)
                        ? "selected"
                        : "unselected"
                }`}
            >
                {laymanContext!.renderPane(tab)}
            </div>
        </>
    );
}
