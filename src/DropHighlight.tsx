import {Position} from "./types";

export function DropHighlight({
    position,
    isDragging,
}: {
    position: Position;
    isDragging: boolean;
}) {
    return (
        <div
            className="layman-drop-highlight"
            style={{
                ...position,
                visibility: isDragging ? "visible" : "hidden",
            }}
        ></div>
    );
}
