import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import {WindowProps} from "./types";

export function Window({position, tab, isSelected}: WindowProps) {
    const {renderPane} = useContext(LaymanContext);

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
            style={{
                top: position.top + windowToolbarHeight,
                left: position.left,
                width: position.width - separatorThickness,
                height:
                    position.height -
                    windowToolbarHeight -
                    separatorThickness / 2,
            }}
            className={`layman-window ${
                isSelected ? "selected" : "unselected"
            }`}
        >
            {renderPane(tab)}
        </div>
    );
}
