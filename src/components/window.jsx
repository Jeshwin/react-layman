import { useState } from "react"
import { motion } from "framer-motion"

export function Window({
    children,
    id,
    className,
    title,
    width = 1,
    height = 1,
}) {
    const [hoveredArea, setHoveredArea] = useState(null)

    const handleHover = (area) => {
        setHoveredArea(area)
        console.log("Hovered area is " + area)
    }

    const handleHoverExit = () => {
        setHoveredArea(null)
        console.log("Hovered area is null")
    }

    return (
        <div
            id={id}
            style={{
                width: `${width * 100}%`,
                height: `${height * 100}%`,
            }}
            className={` ${className} rounded-lg p-4 bg-slate-700 relative`}
        >
            <div className="absolute top-0 left-0 right-0 overflow-clip flex px-4 py-2 rounded-t-lg bg-slate-800">
                {title}
            </div>
            <WindowContent>{children}</WindowContent>
            <motion.div
                id={`highlighter-${id}`}
                className={`absolute rounded-lg border-2 border-fuchsia-600`}
                style={{
                    background:
                        "repeating-linear-gradient(45deg, transparent, transparent 16px, #d946ef 16px, #d946ef 32px)",
                    opacity: 0.2,
                }}
                initial={{ top: "-50%", height: "0%", opacity: 0 }} // Initial position off-screen
                animate={{
                    opacity: hoveredArea == null ? 0 : 0.2,
                    top: hoveredArea === "bottom" ? "auto" : 0,
                    bottom: hoveredArea === "top" ? "auto" : 0,
                    left: hoveredArea === "right" ? "auto" : 0,
                    right: hoveredArea === "left" ? "auto" : 0,
                    width:
                        hoveredArea === "left" || hoveredArea === "right"
                            ? "33.33%"
                            : "auto",
                    height:
                        hoveredArea === "top" || hoveredArea === "bottom"
                            ? "33.33%"
                            : "auto",
                }}
                transition={{ duration: 0.1 }}
            ></motion.div>
            <div
                onMouseEnter={() => handleHover("top")}
                onMouseLeave={handleHoverExit}
                className="absolute top-0 left-0 right-0 h-1/3 bg-transparent"
            ></div>
            <div
                onMouseEnter={() => handleHover("right")}
                onMouseLeave={handleHoverExit}
                className="absolute top-0 bottom-0 right-0 w-1/3 bg-transparent"
            ></div>
            <div
                onMouseEnter={() => handleHover("bottom")}
                onMouseLeave={handleHoverExit}
                className="absolute left-0 bottom-0 right-0 h-1/3 bg-transparent"
            ></div>
            <div
                onMouseEnter={() => handleHover("left")}
                onMouseLeave={handleHoverExit}
                className="absolute top-0 left-0 bottom-0 w-1/3 bg-transparent"
            ></div>
        </div>
    )
}

export function WindowContent({ children }) {
    return (
        <div className="h-full grid place-content-center overflow-clip text-center text-2xl font-mono">
            {children}
        </div>
    )
}
