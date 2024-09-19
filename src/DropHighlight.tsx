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
                opacity: isDragging ? 0.2 : 0,
            }}
        ></div>
    );
}
