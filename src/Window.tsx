import {windowToolbarHeight} from "./constants";
import {Inset} from "./Inset";
import {LaymanKey} from "./types";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";

export function Window({inset, tab}: {inset: Inset; tab: LaymanKey}) {
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
                className={`layman-window ${
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
