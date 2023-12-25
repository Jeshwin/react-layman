import Draggable from "react-draggable"

export function RowSeparator({ parentClass, index }) {
    return (
        <Draggable axis="x">
            <div
                className={`z-50 h-full w-2 hover:opacity-50 cursor-ew-resize grid place-content-center`}
            >
                <div className="w-0.5 rounded-full h-10 bg-slate-50"></div>
            </div>
        </Draggable>
    )
}

export function ColumnSeparator({ parentClass, index }) {
    return (
        <Draggable axis="y">
            <div
                className={` z-50 w-full h-2 hover:opacity-50 cursor-ns-resize grid place-content-center`}
            >
                <div className="h-0.5 rounded-full w-10 bg-slate-50"></div>
            </div>
        </Draggable>
    )
}
