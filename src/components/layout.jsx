export function Row({ children, id, className, width = 1, height = 1 }) {
    return (
        <div
            id={id}
            style={{
                width: `${width * 100}%`,
                height: `${height * 100}%`,
            }}
            className={`${className} flex flex-row space-x-0.5`}
        >
            {children}
        </div>
    )
}

export function Column({ children, id, className, width = 1, height = 1 }) {
    return (
        <div
            id={id}
            style={{
                width: `${width * 100}%`,
                height: `${height * 100}%`,
            }}
            className={`${className} flex flex-col space-y-0.5`}
        >
            {children}
        </div>
    )
}
