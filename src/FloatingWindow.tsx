import {useContext, useEffect, useRef} from "react";
import {LaymanContext} from "./LaymanContext";
import {FloatingWindowData, Position} from "./types";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ResizeInteraction {
    dir: ResizeDir;
    startX: number;
    startY: number;
    startPos: Position;
}

/**
 * Resize handles for a single floating window.
 *
 * A floating window's toolbar and pane content render through the exact same
 * `WindowToolbar`/`Window` components (and the same flat lists) used for
 * tiled windows - see `Layman.tsx`. The one thing tiled windows never need,
 * because their size comes from the split tree, is free-form resizing from
 * an edge/corner. That's the only floating-specific chrome left: a thin,
 * absolutely-positioned overlay spanning the floating window's current rect
 * with 8 drag handles that dispatch `setFloatingWindowPosition`.
 */
function FloatingWindowResizeHandles({data}: {data: FloatingWindowData}) {
    const {layoutDispatch} = useContext(LaymanContext);
    const interactionRef = useRef<ResizeInteraction | null>(null);

    useEffect(() => {
        const onMove = (event: MouseEvent) => {
            const interaction = interactionRef.current;
            if (!interaction) return;
            const dx = event.clientX - interaction.startX;
            const dy = event.clientY - interaction.startY;
            const start = interaction.startPos;

            let {top, left, width, height} = start;
            if (interaction.dir.includes("e")) width = Math.max(MIN_WIDTH, start.width + dx);
            if (interaction.dir.includes("s")) height = Math.max(MIN_HEIGHT, start.height + dy);
            if (interaction.dir.includes("w")) {
                width = Math.max(MIN_WIDTH, start.width - dx);
                left = start.left + (start.width - width);
            }
            if (interaction.dir.includes("n")) {
                height = Math.max(MIN_HEIGHT, start.height - dy);
                top = start.top + (start.height - height);
            }

            layoutDispatch({
                type: "setFloatingWindowPosition",
                floatingId: data.id,
                position: {top, left, width, height},
            });
        };

        const onUp = () => {
            interactionRef.current = null;
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        // onMove/onUp only read interactionRef.current (a ref, always current) and
        // the stable layoutDispatch from context, so neither needs to be a dep.
        // Re-subscribing only when the floating window's own identity changes is
        // intentional, since re-running per render would drop in-progress drags.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.id]);

    const startResize = (dir: ResizeDir) => (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        layoutDispatch({type: "bringFloatingWindowToFront", floatingId: data.id});
        interactionRef.current = {dir, startX: event.clientX, startY: event.clientY, startPos: data.position};
    };

    const resizeHandles: ResizeDir[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

    return (
        <div
            className="layman-floating-resize-handles"
            style={{
                position: "absolute",
                top: data.position.top,
                left: data.position.left,
                width: data.position.width,
                height: data.position.height,
                zIndex: data.zIndex + 1,
                pointerEvents: "none",
            }}
        >
            {resizeHandles.map((dir) => (
                <div key={dir} className={`layman-floating-resize ${dir}`} onMouseDown={startResize(dir)}></div>
            ))}
        </div>
    );
}

/**
 * Renders the resize-handle overlay for every floating window. Mounted once
 * (in `Layman.tsx`), above the tiled layout.
 */
export function FloatingResizeHandleLayer() {
    const {floatingWindows} = useContext(LaymanContext);
    return (
        <>
            {floatingWindows.map((data) => (
                <FloatingWindowResizeHandles key={data.id} data={data} />
            ))}
        </>
    );
}
