import {separatorThickness, windowToolbarHeight} from "./constants";
import {useLayout} from "./LayoutContext";
import {Inset} from "./Insets";
import {stringToUUID} from "./renderFunctions";

export default function Window({inset, tab, path, selectedTabIds}) {
    const {renderPane, nexusRef} = useLayout();

    const windowId = stringToUUID(path.join(":") + tab);
    const adjustedInset = new Inset({
        ...inset,
        top:
            inset.top +
            (nexusRef.current
                ? (100 * (windowToolbarHeight + separatorThickness)) /
                  nexusRef.current.getBoundingClientRect().height
                : 0),
    });

    return (
        <div
            id={windowId}
            style={{
                inset: adjustedInset.toString(),
                position: "absolute",
                margin: `${separatorThickness / 2}px`,
                marginTop: 0,
            }}
            className={`rounded bg-zinc-800 overflow-hidden ${
                selectedTabIds.includes(windowId) ? "visible" : "invisible"
            }`}
        >
            {renderPane(tab, path)}
        </div>
    );
}
