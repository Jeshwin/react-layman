import {useContext, useEffect, useState} from "react";
import {LaymanContext} from "./LaymanContext";
import {WindowProps} from "./types";
import {useDragLayer} from "react-dnd";
import {createPortal} from "react-dom";

export function Window({position, tab, isSelected}: WindowProps) {
    const {renderPane, draggedWindowTabs, windowDragStartPosition} =
        useContext(LaymanContext);

    const separatorThickness =
        parseInt(
            getComputedStyle(document.documentElement)
                .getPropertyValue("--separator-thickness")
                .trim(),
            10
        ) ?? 8;

    const windowToolbarHeight =
        parseInt(
            getComputedStyle(document.documentElement)
                .getPropertyValue("--toolbar-height")
                .trim(),
            10
        ) ?? 64;

    // Custom drag layer to track mouse position during dragging
    const {clientOffset} = useDragLayer((monitor) => ({
        clientOffset: monitor.getClientOffset(),
    }));

    // State to keep track of the current mouse position (top, left) during dragging
    const [currentMousePosition, setCurrentMousePosition] = useState({
        top: position.top,
        left: position.left,
    });

    // Effect to handle dragging logic and update the current mouse position during dragging
    useEffect(() => {
        if (draggedWindowTabs.includes(tab) && clientOffset) {
            const deltaX = windowDragStartPosition.x;
            const deltaY = windowDragStartPosition.y;
            setCurrentMousePosition({
                top: clientOffset.y - deltaY,
                left: clientOffset.x - deltaX,
            });
        } else {
            setCurrentMousePosition({
                top: 0,
                left: 0,
            });
        }
    }, [draggedWindowTabs, windowDragStartPosition, tab, clientOffset]);

    const [portalElement, setPortalElement] = useState<HTMLElement | null>(
        null
    );

    // Check for the portal target element when the component mounts
    useEffect(() => {
        const element = document.getElementById("drag-window-border");
        if (element) {
            setPortalElement(element);
        } else {
            console.error("Element with id 'drag-window-border' not found.");
        }
    }, []);

    if (!portalElement) {
        return null; // Don't render until portal element is available
    }

    const scale = draggedWindowTabs.includes(tab) ? 0.7 : 1;

    return (
        <div
            id={tab.id}
            style={{
                top:
                    (position.top + windowToolbarHeight) * scale +
                    currentMousePosition.top -
                    (draggedWindowTabs.includes(tab)
                        ? windowToolbarHeight * scale * 0.5 + 8
                        : 0),
                left: position.left * scale + currentMousePosition.left,
                width: position.width - separatorThickness,
                height:
                    position.height -
                    windowToolbarHeight -
                    separatorThickness / 2,
                transform: `scale(${scale})`,
                transformOrigin: `${windowDragStartPosition.x}px ${windowDragStartPosition.y}px`,
                zIndex: draggedWindowTabs.includes(tab) ? 12 : "auto",
                pointerEvents: draggedWindowTabs.includes(tab)
                    ? "none"
                    : "auto",
            }}
            className={`layman-window ${
                isSelected ? "selected" : "unselected"
            }`}
        >
            {draggedWindowTabs.includes(tab) &&
                createPortal(
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 15,
                            top:
                                (position.top + windowToolbarHeight) * scale +
                                currentMousePosition.top -
                                (draggedWindowTabs.includes(tab)
                                    ? windowToolbarHeight * scale * 0.5 + 8
                                    : 0),
                            left:
                                position.left * scale +
                                currentMousePosition.left +
                                12,
                            width: position.width - separatorThickness + 2,
                            height:
                                position.height -
                                windowToolbarHeight -
                                separatorThickness / 2 +
                                2,
                            transform: `scale(${scale})`,
                            transformOrigin: `${windowDragStartPosition.x}px ${windowDragStartPosition.y}px`,
                            border: "1px solid var(--indicator-color, #f97316)",
                            borderRadius: "var(--border-radius, 8px)",
                            pointerEvents: "none",
                            userSelect: "none",
                        }}
                    ></div>,
                    document.getElementById("drag-window-border")!
                )}
            {renderPane(tab)}
        </div>
    );
}
