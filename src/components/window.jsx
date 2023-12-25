export function Window({ children, id, className, title, width = 1, height = 1 }) {
    return (
        <div
        id={id}
            style={{
                width: `${width * 100}%`,
                height: `${height * 100}%`,
            }}
            className={` ${className} rounded-lg p-4 bg-slate-700 relative`}
        >
            <div className="absolute top-0 left-0 right-0 flex px-4 py-2 rounded-t-lg bg-slate-800">
                {title}
            </div>
            <WindowContent>{children}</WindowContent>
        </div>
    )
}

export function WindowContent({ children }) {
    return (
        <div 
        className="h-full grid place-content-center overflow-clip text-center text-2xl font-mono">
            {children}
        </div>
    )
}
