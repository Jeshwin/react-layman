import {separatorThickness, windowToolbarHeight} from "./constants";
import {useLayout} from "./LayoutContext";
import {Inset} from "./Insets";
import {useEffect} from "react";

export default function Window({inset, tab}) {
    const {renderPane, nexusRef, selectedTabIds} = useLayout();

    //! DEBUG: log when tab is re-rendered
    useEffect(() => {
        console.log(`re-rendering tab ${tab} ???`);
    }, [tab]);

    const adjustedInset = new Inset({
        ...inset,
        top:
            inset.top +
            (nexusRef.current
                ? (100 * windowToolbarHeight) /
                  nexusRef.current.getBoundingClientRect().height
                : 0),
    });

    return (
        <div
            id={tab}
            style={{
                inset: adjustedInset.toString(),
                position: "absolute",
                margin: `${separatorThickness / 2}px`,
                marginTop: 0,
            }}
            className={`rounded bg-zinc-800 overflow-hidden ${
                selectedTabIds.includes(tab) ? "visible" : "invisible"
            }`}
        >
            {renderPane(tab)}
        </div>
    );
}
