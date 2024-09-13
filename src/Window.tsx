import {Inset} from "./Inset";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import Droppable from "./dnd/Droppable";
import {TabData} from "./TabData";

export function Window({inset, tab}: {inset: Inset; tab: TabData}) {
    const {laymanRef, windowToolbarHeight, renderPane} =
        useContext(LaymanContext);

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
            style={{
                inset: adjustedInset.toString(),
            }}
            className={`layman-window ${
                tab.isSelected ? "selected" : "unselected"
            }`}
        >
            <Droppable id={tab.id}>{renderPane(tab)}</Droppable>
        </div>
    );
}
