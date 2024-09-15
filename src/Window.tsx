import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {useDrop} from "react-dnd";
import {Position, TabType} from "./types";

export function Window({position, tab}: {position: Position; tab: TabData}) {
    const {renderPane} = useContext(LaymanContext);
    const [, drop] = useDrop(() => ({
        accept: TabType,
        drop: (item: TabData) => {
            console.log(`Dropped ${item.id} onto ${tab.id}`);
            console.dir(item);
        },
    }));
    const separatorThickness =
        parseInt(
            getComputedStyle(document.documentElement)
                .getPropertyValue("--separator-thickness")
                .trim(),
            10
        ) ?? 8;

    const windowToolbarHeight =
        parseInt(
            getComputedStyle(document.documentElement)
                .getPropertyValue("--toolbar-height")
                .trim(),
            10
        ) ?? 64;

    return (
        <div
            id={tab.id}
            ref={drop}
            style={{
                top: position.top + windowToolbarHeight,
                left: position.left,
                width: position.width - separatorThickness,
                height:
                    position.height -
                    windowToolbarHeight -
                    separatorThickness / 2,
            }}
            className={`layman-window selected`}
        >
            {renderPane(tab)}
        </div>
    );
}
