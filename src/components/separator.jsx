export function RowSeparator({ id }) {
    return (
        <div
            id={id}
            className={`h-full w-2 hover:opacity-50 cursor-ew-resize grid place-content-center`}
        >
            <div className="w-0.5 rounded-full h-10 bg-slate-50"></div>
        </div>
    )
}

export function ColumnSeparator({ id }) {
    return (
        <div
            id={id}
            className={`w-full h-2 hover:opacity-50 cursor-ns-resize grid place-content-center`}
        >
            <div className="h-0.5 rounded-full w-10 bg-slate-50"></div>
        </div>
    )
}
