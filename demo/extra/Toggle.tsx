export default function Toggle({
    checked,
    onCheck,
    spanText,
}: {
    checked: boolean;
    onCheck: () => void;
    spanText: string;
}) {
    return (
        <label
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                margin: "0 6px",
                cursor: "pointer",
                userSelect: "none",
                fontSize: 13,
                fontWeight: 500,
                color: "#c6d0f5",
                whiteSpace: "nowrap",
            }}
        >
            {/* Hidden native checkbox for accessibility */}
            <input
                type="checkbox"
                checked={checked}
                onChange={onCheck}
                style={{position: "absolute", opacity: 0, width: 0, height: 0}}
            />
            {/* Custom pill toggle */}
            <span
                style={{
                    position: "relative",
                    display: "inline-block",
                    width: "2rem",
                    height: "1rem",
                    borderRadius: "1rem",
                    backgroundColor: checked ? "#a6d189" : "#414559",
                    transition: "background-color 0.2s, border-color 0.2s",
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        top: 2,
                        left: checked ? 18 : 2,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: "#232634",
                        // backgroundColor: checked ? "#232634" : "#8c8fa1",
                        transition: "left 0.2s, background-color 0.2s",
                    }}
                />
            </span>
            <span>{spanText}</span>
        </label>
    );
}
