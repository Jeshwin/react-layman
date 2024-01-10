import { createContext, useContext, useState, useEffect } from "react"
import { useDrag, useDrop } from "react-dnd"

function WindowSpawner({ color }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "WINDOW",
        item: { color },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))
    return (
        <div
            ref={drag}
            className={`cursor-move ${
                isDragging ? "opacity-90" : ""
            } aspect-square rounded-lg w-20`}
            style={{
                backgroundColor: color,
            }}
        ></div>
    )
}

function ColoredWindow({ color, index }) {
    const { windows } = useContext(WindowsContext)
    return (
        <div
            className={`w-full h-full rounded-lg mx-2`}
            style={{
                backgroundColor: color,
            }}
            onClick={() => {
                // Handle click event or add any additional functionality
                console.log(
                    `Index: ${index} Windows: ${JSON.stringify(windows)}`
                )
            }}
        ></div>
    )
}

function DesktopTarget() {
    const { windows, addDroppedWindow } = useContext(WindowsContext)

    const [, drop] = useDrop(() => ({
        accept: "WINDOW",
        drop: (item, monitor) => {
            // Use the desktop target ID to get the element and its width
            const desktopElement = document.getElementById("demo-desktop")
            const totalWidth = desktopElement ? desktopElement.offsetWidth : 0

            const offset = monitor.getClientOffset().x
            const dropPosition = offset - desktopElement.offsetLeft

            console.log(`Dropped at ${dropPosition}`)
            console.log(`Total width is ${totalWidth}`)

            // Insert the new window at the calculated index
            addDroppedWindow(
                { type: "WINDOW", color: item.color },
                dropPosition,
                totalWidth
            )
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }))

    useEffect(() => {
        console.log("Updated DesktopTarget:", windows)
    }, [windows])

    return (
        <div
            id="demo-desktop"
            ref={drop}
            className="py-2 flex-1 flex justify-center items-center rounded-xl bg-slate-800 border border-slate-500"
        >
            {windows.map((window, index) => (
                <ColoredWindow key={index} index={index} color={window.color} />
            ))}
            <span className="text-2xl">
                {windows.length > 0 ? "" : "Empty"}
            </span>
        </div>
    )
}

const WindowsContext = createContext()

function WindowsProvider({ children }) {
    const [windows, setWindows] = useState([])

    const addWindow = (window, index = -1) => {
        setWindows((prevWindows) => {
            const newWindows = [...prevWindows]

            // If index is -1, add the window to the end; otherwise, insert at the specified index
            if (index === -1) {
                newWindows.push(window)
            } else {
                newWindows.splice(index, 0, window)
            }

            return newWindows
        })
    }

    const addDroppedWindow = (window, dropPosition, totalWidth) => {
        setWindows((prevWindows) => {
            const newWindows = [...prevWindows]
            const index = Math.round(
                (dropPosition / totalWidth) * prevWindows.length
            )
            console.log(
                `index = ${dropPosition / totalWidth} * ${
                    prevWindows.length
                } = ${index}`
            )

            newWindows.splice(index, 0, window)
            return newWindows
        })
    }

    useEffect(() => {
        console.log("Updated WindowsProvider:", windows)
    }, [windows])

    const updateWindow = (index, updatedWindow) => {
        setWindows((prevWindows) => {
            const newWindows = [...prevWindows]
            newWindows[index] = updatedWindow
            return newWindows
        })
    }

    return (
        <WindowsContext.Provider
            value={{ windows, addWindow, addDroppedWindow, updateWindow }}
        >
            {children}
        </WindowsContext.Provider>
    )
}

export default function DragNDrop() {
    return (
        <WindowsProvider>
            {" "}
            <div className="flex space-x-4">
                {/* Three colored squares */}
                <div className="grid grid-cols-1 gap-y-4">
                    <WindowSpawner color={"#DC0073"} />
                    <WindowSpawner color={"#008BF8"} />
                    <WindowSpawner color={"#04E762"} />
                </div>
                {/* Gray rectangle */}
                <DesktopTarget />
            </div>
        </WindowsProvider>
    )
}
