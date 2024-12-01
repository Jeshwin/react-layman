import {MouseEventHandler, useEffect, useRef, useState} from "react";

export default function ResizeTester() {
    const [width, setWidth] = useState(300);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const minWidth = 100;
    const maxWidth = 500;

    // Toggle isDragging when holding separator
    const handleMouseUp: MouseEventHandler = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleMouseDown: MouseEventHandler = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            event.preventDefault();
            if (!isDragging || !containerRef.current) return;
            const newWidth = event.clientX - containerRef.current.getBoundingClientRect().left - 36;
            setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
        };

        const handleMouseUpListener = (event: MouseEvent) => {
            event.preventDefault();
            setIsDragging(false);
        };

        // Add event listeners to document
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUpListener);

        // Clean up event listeners when component unmounts
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUpListener);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            style={{
                width: width,
                flex: "none",
                border: "1px dashed white",
                borderRadius: 8,
                padding: 16,
                position: "relative",
                display: "grid",
                placeContent: "center",
            }}
        >
            <div style={{textAlign: "center", fontSize: 28, marginBottom: 16}}>Test Resizing!</div>
            <div style={{textAlign: "center"}}>Drag the handle on the right to resize the layout</div>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: 8,
                    display: "grid",
                    placeContent: "center",
                    cursor: "ew-resize",
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                <div
                    style={{
                        height: 96,
                        width: 4,
                        backgroundColor: "white",
                        borderRadius: 9999,
                    }}
                ></div>
            </div>
        </div>
    );
}
