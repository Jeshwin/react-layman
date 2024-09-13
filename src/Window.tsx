import {Inset} from "./Inset";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {useDrop} from "react-dnd";

// Define a type for the draggable item
const TabType = "TAB";

export function Window({inset, tab}: {inset: Inset; tab: TabData}) {
    const {laymanRef, windowToolbarHeight, renderPane} =
        useContext(LaymanContext);
    const [, drop] = useDrop(() => ({
        accept: TabType,
        drop: (item: TabData) => {
            console.log(`Dropped ${item.id} onto ${tab.id}`);
            console.dir(item);
        },
    }));

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
