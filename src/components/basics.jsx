import { useRef, useState } from "react"
import Draggable from "react-draggable"
import { WindowContent } from "./window"

const MAGIC_NUMBER = 1000000

export default function Basics() {
    const [separatorPosition, setSeparatorPosition] = useState(50)
    const containerRef = useRef(null)

    const handleDrag = (_e, ui) => {
        const { x } = ui

        // Calculate the percentage position of the separator
        const containerWidth = containerRef.current.offsetWidth
        const newPosition = 50 + ((MAGIC_NUMBER * x) / containerWidth) * 100

        console.log(`x: ${x}. New Position: ${newPosition}`)

        // Update the state with the new separator position
        setSeparatorPosition(newPosition)
    }

    return (
        <div ref={containerRef} className="flex space-x-0.5 h-64">
            <div
                id="section-1"
                style={{ width: `${separatorPosition}%` }}
                className="flex-grow bg-slate-700 rounded-lg"
            >
                <WindowContent>Section #1</WindowContent>
            </div>
            <Draggable axis="x" scale={MAGIC_NUMBER} onDrag={handleDrag}>
                <div className="h-full w-2 hover:opacity-50 cursor-ew-resize grid place-content-center">
                    <div className="w-0.5 rounded-full h-10 bg-slate-50"></div>
                </div>
            </Draggable>
            <div
                id="section-2"
                style={{ width: `${100 - separatorPosition}%` }}
                className="flex-grow bg-slate-700 rounded-lg"
            >
                <WindowContent>Section #2</WindowContent>
            </div>
        </div>
    )
}
