import {useContext, useEffect, useState} from "react";
import {LaymanContext} from "./LaymanContext";
import {useDragLayer} from "react-dnd";
import {createPortal} from "react-dom";
import {WindowContext} from "./WindowContext";
import {Position, WindowProps} from "./types";

export function Window({position, path, tab, isSelected}: WindowProps) {
    const {globalContainerSize, renderPane, draggedWindowTabs, windowDragStartPosition} = useContext(LaymanContext);

    const separatorThickness =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;

    const windowToolbarHeight =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64;
    const isDragging = draggedWindowTabs.includes(tab);
    const scale = isDragging ? 0.7 : 1;

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
        if (isDragging && clientOffset) {
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
    }, [clientOffset, isDragging, windowDragStartPosition.x, windowDragStartPosition.y]);

    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

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

    const adjustedWindowPosition: Position = {
        top: position.top + windowToolbarHeight + separatorThickness / 2 + currentMousePosition.top,
        left: position.left * scale + currentMousePosition.left,
        width: position.width - separatorThickness,
        height: position.height - windowToolbarHeight - separatorThickness,
    };

    const borderPosition: Position = {
        top: position.top + (windowToolbarHeight / 2) * scale + currentMousePosition.top + globalContainerSize.top,
        left: position.left * scale + currentMousePosition.left + globalContainerSize.left,
        width: position.width - separatorThickness,
        height: position.height - separatorThickness / 2,
    };

    return (
        <div
            id={tab.id}
            style={{
                ...adjustedWindowPosition,
                transform: `scale(${scale})`,
                transformOrigin: `${windowDragStartPosition.x}px top`,
                zIndex: isDragging ? 12 : 5,
                pointerEvents: isDragging ? "none" : "auto",
            }}
            className={`layman-window ${isSelected ? "selected" : "unselected"}`}
        >
            {isDragging &&
                createPortal(
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 12,
                            ...borderPosition,
                            transform: `scale(${scale})`,
                            transformOrigin: `${windowDragStartPosition.x}px top`,
                            border: "1px solid var(--indicator-color, #f97316)",
                            borderRadius: "var(--border-radius, 8px)",
                            pointerEvents: "none",
                            userSelect: "none",
                        }}
                    ></div>,
                    document.getElementById("drag-window-border")!
                )}
            <WindowContext.Provider
                value={{
                    position,
                    path,
                    tab,
                    isSelected,
                }}
            >
                {renderPane(tab)}
            </WindowContext.Provider>
        </div>
    );
}
