import {useDrop} from "react-dnd";
import {LaymanPath, TabType} from "./types";
import {TabData} from "./TabData";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";

export function WindowDropTarget({
    path,
    placement,
}: {
    path: LaymanPath;
    placement: "top" | "left" | "bottom" | "right" | "center";
}) {
    const {layoutDispatch} = useContext(LaymanContext);
    const [, drop] = useDrop(() => ({
        accept: TabType,
        drop: (item: {tab: TabData; path: LaymanPath}) => {
            layoutDispatch({
                type: "moveTab",
                tab: item.tab,
                path: item.path,
                newPath: path,
                placement: placement,
            });
        },
    }));
    return (
        <div
            ref={drop}
            className={`layman-window-drop-target ${placement}`}
        ></div>
    );
}
