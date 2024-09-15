import {Inset} from "./Inset";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {useDrop} from "react-dnd";
import {TabType} from "./types";

export function Window({inset, tab}: {inset: Inset; tab: TabData}) {
    const {laymanRef, renderPane} = useContext(LaymanContext);
    const [, drop] = useDrop(() => ({
        accept: TabType,
        drop: (item: TabData) => {
            console.log(`Dropped ${item.id} onto ${tab.id}`);
            console.dir(item);
        },
    }));

    const windowToolbarHeight =
        parseInt(
            getComputedStyle(document.documentElement)
                .getPropertyValue("--toolbar-height")
                .trim(),
            10
        ) ?? 64;

    const adjustedInset = new Inset({
        ...inset,
        top:
            inset.top +
            (laymanRef
                ? (100 * windowToolbarHeight) /
                  laymanRef.current!.getBoundingClientRect().height
                : 0),
    });

    return (
        <div
            id={tab.id}
            ref={drop}
            style={{
                inset: adjustedInset.toString(),
            }}
            className={`layman-window ${
                tab.isSelected ? "selected" : "unselected"
            }`}
        >
            {renderPane(tab)}
        </div>
    );
}
