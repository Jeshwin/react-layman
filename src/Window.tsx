import {useContext, useEffect, useState} from "react";
import {LaymanContext} from "./LaymanContext";
import {WindowProps} from "./types";
import {useDragLayer} from "react-dnd";
import {createPortal} from "react-dom";

export function Window({position, tab, isSelected}: WindowProps) {
    const {laymanRef, renderPane, draggedWindowTabs, windowDragStartPosition} =
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
    // Get offset of layout from top-left corner of whole window
    const layoutOffset =
        laymanRef && laymanRef.current
            ? laymanRef.current.getBoundingClientRect()
            : {
                  top: 0,
                  left: 0,
              };
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
    }, [
        draggedWindowTabs,
        windowDragStartPosition,
        tab,
        clientOffset,
        isDragging,
    ]);

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

    return (
        <div
            id={tab.id}
            style={{
                top:
                    position.top +
                    windowToolbarHeight +
                    currentMousePosition.top,
                left: position.left * scale + currentMousePosition.left,
                width: position.width - separatorThickness,
                height:
                    position.height -
                    windowToolbarHeight -
                    separatorThickness / 2,
                transform: `scale(${scale})`,
                transformOrigin: `${windowDragStartPosition.x}px top`,
                zIndex: isDragging ? 12 : "auto",
                pointerEvents: isDragging ? "none" : "auto",
            }}
            className={`layman-window ${
                isSelected ? "selected" : "unselected"
            }`}
        >
            {isDragging &&
                createPortal(
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 15,
                            top:
                                position.top +
                                (windowToolbarHeight / 2) * scale +
                                currentMousePosition.top +
                                layoutOffset.top,
                            left:
                                position.left * scale +
                                currentMousePosition.left +
                                layoutOffset.left,
                            width: position.width - separatorThickness,
                            height: position.height - separatorThickness / 2,
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
            {renderPane(tab)}
        </div>
    );
}
