import {ReactNode, useCallback, useEffect, useRef, useState} from "react";

type Point = {x: number; y: number};

export default function FloatingPanel({
    title = "Controls",
    initialPosition = {x: 16, y: 16},
    children,
}: {
    title?: string;
    initialPosition?: Point;
    children: ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [position, setPosition] = useState<Point>(initialPosition);
    const dragState = useRef<{offsetX: number; offsetY: number} | null>(null);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!dragState.current) return;
        // Keep the panel within the viewport bounds.
        const x = Math.max(0, Math.min(window.innerWidth - 40, e.clientX - dragState.current.offsetX));
        const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragState.current.offsetY));
        setPosition({x, y});
    }, []);

    const handlePointerUp = useCallback(() => {
        dragState.current = null;
    }, []);

    useEffect(() => {
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp]);

    const startDrag = (e: React.PointerEvent) => {
        dragState.current = {
            offsetX: e.clientX - position.x,
            offsetY: e.clientY - position.y,
        };
    };

    return (
        <div
            style={{
                position: "fixed",
                top: position.y,
                left: position.x,
                zIndex: 1000,
                width: 280,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "#292c3c",
                border: "1px solid #51576d",
                boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                fontFamily: "'Inter', sans-serif",
                color: "#c6d0f5",
                userSelect: "none",
            }}
        >
            {/* Header — drag handle + collapse toggle */}
            <div
                onPointerDown={startDrag}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 34,
                    paddingInline: 12,
                    backgroundColor: "#232634",
                    borderBottom: collapsed ? "none" : "1px solid #51576d",
                    cursor: "grab",
                }}
            >
                <span style={{fontSize: 13, fontWeight: 600, letterSpacing: "0.02em"}}>{title}</span>
                <button
                    type="button"
                    aria-label={collapsed ? "Expand" : "Collapse"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setCollapsed((c) => !c)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        padding: 0,
                        borderRadius: 5,
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#c6d0f5",
                        cursor: "pointer",
                    }}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{
                            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                            transition: "transform 0.15s",
                        }}
                    >
                        <path
                            d="M2.5 4.5L6 8L9.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Body */}
            {!collapsed && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        padding: 12,
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
