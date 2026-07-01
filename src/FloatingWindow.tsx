import {useContext, useEffect, useRef, useState} from "react";
import {LaymanContext} from "./LaymanContext";
import {WindowContext} from "./WindowContext";
import {ToolbarButton} from "./ToolbarButton";
import {CloseIcon, UnfloatIcon} from "./Icons";
import {findWindowAtPoint} from "./layoutGeometry";
import {FloatingWindowData, Position} from "./types";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface Interaction {
    type: "move" | "resize";
    dir?: ResizeDir;
    startX: number;
    startY: number;
    startPos: Position;
}

/**
 * A window that has been floated out of the layout. It can be dragged by its
 * top bar, resized from any edge/corner, raised to the front on focus, and
 * un-floated back into the layout window under its center.
 */
export function FloatingWindow({data}: {data: FloatingWindowData}) {
    const {layout, globalContainerSize, layoutDispatch, renderPane, renderTab, setFloatingWindows} =
        useContext(LaymanContext);

    const [pos, setPos] = useState<Position>(data.position);
    const [selectedIndex, setSelectedIndex] = useState<number>(data.selectedIndex);
    const interactionRef = useRef<Interaction | null>(null);

    // Keep local position in sync if the stored position changes externally.
    useEffect(() => {
        setPos(data.position);
    }, [data.position]);

    // Persist the local position back to context (called at the end of a gesture).
    const persistPosition = (next: Position) => {
        setFloatingWindows((prev) => prev.map((fw) => (fw.id === data.id ? {...fw, position: next} : fw)));
    };

    const bringToFront = () => {
        setFloatingWindows((prev) => {
            const topZ = prev.reduce((max, fw) => Math.max(max, fw.zIndex), 29);
            if (data.zIndex === topZ && topZ !== 29) return prev;
            return prev.map((fw) => (fw.id === data.id ? {...fw, zIndex: topZ + 1} : fw));
        });
    };

    const removeSelf = () => {
        setFloatingWindows((prev) => prev.filter((fw) => fw.id !== data.id));
    };

    // Unfloat: move all tabs into the layout window under this float's center.
    const unfloat = () => {
        const center = {x: pos.left + pos.width / 2, y: pos.top + pos.height / 2};
        let targetPath = findWindowAtPoint(layout, globalContainerSize, center);

        // Fallback: if the center is over nothing but the layout is empty, seed
        // a brand new root window. Otherwise, do nothing (stay floating).
        if (targetPath === null) {
            if (!layout) {
                targetPath = [];
            } else {
                return;
            }
        }

        data.tabs.forEach((tab) => {
            layoutDispatch({type: "addTab", path: targetPath as number[], tab});
        });
        layoutDispatch({
            type: "selectTab",
            path: targetPath as number[],
            tab: data.tabs[selectedIndex] ?? data.tabs[0],
        });
        removeSelf();
    };

    useEffect(() => {
        const onMove = (event: MouseEvent) => {
            const interaction = interactionRef.current;
            if (!interaction) return;
            const dx = event.clientX - interaction.startX;
            const dy = event.clientY - interaction.startY;
            const start = interaction.startPos;

            if (interaction.type === "move") {
                setPos({...start, top: start.top + dy, left: start.left + dx});
                return;
            }

            // Resize
            const dir = interaction.dir!;
            let {top, left, width, height} = start;
            if (dir.includes("e")) width = Math.max(MIN_WIDTH, start.width + dx);
            if (dir.includes("s")) height = Math.max(MIN_HEIGHT, start.height + dy);
            if (dir.includes("w")) {
                width = Math.max(MIN_WIDTH, start.width - dx);
                left = start.left + (start.width - width);
            }
            if (dir.includes("n")) {
                height = Math.max(MIN_HEIGHT, start.height - dy);
                top = start.top + (start.height - height);
            }
            setPos({top, left, width, height});
        };

        const onUp = () => {
            if (interactionRef.current) {
                interactionRef.current = null;
                setPos((current) => {
                    persistPosition(current);
                    return current;
                });
            }
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.id]);

    const startInteraction = (type: "move" | "resize", dir?: ResizeDir) => (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        bringToFront();
        interactionRef.current = {type, dir, startX: event.clientX, startY: event.clientY, startPos: pos};
    };

    const selectedTab = data.tabs[selectedIndex] ?? data.tabs[0];

    const resizeHandles: ResizeDir[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

    return (
        <div
            className="layman-floating-window"
            style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
                zIndex: data.zIndex,
            }}
            onMouseDown={bringToFront}
        >
            {/* Top bar: drag handle + tabs + controls */}
            <div className="layman-floating-topbar" onMouseDown={startInteraction("move")}>
                <div className="layman-floating-tabs">
                    {data.tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            className={`layman-floating-tab ${index === selectedIndex ? "selected" : ""}`}
                            onMouseDown={(event) => {
                                event.stopPropagation();
                                setSelectedIndex(index);
                            }}
                        >
                            {renderTab(tab)}
                        </button>
                    ))}
                </div>
                <div className="layman-floating-controls">
                    <ToolbarButton onMouseDown={(event) => event.stopPropagation()} onClick={unfloat} title="Unfloat">
                        <UnfloatIcon />
                    </ToolbarButton>
                    <ToolbarButton onMouseDown={(event) => event.stopPropagation()} onClick={removeSelf} title="Close">
                        <CloseIcon />
                    </ToolbarButton>
                </div>
            </div>

            {/* Pane content */}
            <div className="layman-floating-content">
                {selectedTab && (
                    <WindowContext.Provider value={{position: pos, path: [], tab: selectedTab, isSelected: true}}>
                        {renderPane(selectedTab)}
                    </WindowContext.Provider>
                )}
            </div>

            {/* Resize handles */}
            {resizeHandles.map((dir) => (
                <div
                    key={dir}
                    className={`layman-floating-resize ${dir}`}
                    onMouseDown={startInteraction("resize", dir)}
                />
            ))}
        </div>
    );
}

/**
 * Renders all floating windows. Mounted once (in the provider) above the layout.
 */
export function FloatingLayer() {
    const {floatingWindows} = useContext(LaymanContext);
    return (
        <>
            {floatingWindows.map((data) => (
                <FloatingWindow key={data.id} data={data} />
            ))}
        </>
    );
}
