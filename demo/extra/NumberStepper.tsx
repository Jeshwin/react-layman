export default function NumberStepper({
    value,
    onChange,
    min,
    max,
    label,
}: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    label?: string;
}) {
    const clamp = (v: number) => Math.min(max, Math.max(min, v));
    const canDecrement = value > min;
    const canIncrement = value < max;

    const stepButtonStyle = (enabled: boolean): React.CSSProperties => ({
        width: 28,
        height: 28,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        borderRadius: 6,
        border: "1px solid #626880",
        backgroundColor: "#414559",
        color: "#c6d0f5",
        cursor: enabled ? "pointer" : "not-allowed",
        opacity: enabled ? 1 : 0.4,
        transition: "opacity 0.15s, background-color 0.15s",
    });

    return (
        <label
            style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                margin: "0 6px",
                fontSize: 13,
                fontWeight: 500,
                color: "#c6d0f5",
            }}
        >
            {label && <span>{label}</span>}
            <span style={{display: "inline-flex", alignItems: "center", gap: 4}}>
                <button
                    type="button"
                    aria-label="Decrement"
                    disabled={!canDecrement}
                    onClick={() => onChange(clamp(value - 1))}
                    style={stepButtonStyle(canDecrement)}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <line
                            x1="2.5"
                            y1="6"
                            x2="9.5"
                            y2="6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
                <input
                    type="number"
                    className="number-stepper-input"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(clamp(Number(e.target.value)))}
                    style={{
                        width: 40,
                        height: 28,
                        boxSizing: "border-box",
                        textAlign: "center",
                        paddingInline: 4,
                        borderRadius: 6,
                        border: "1px solid #626880",
                        backgroundColor: "#414559",
                        color: "#c6d0f5",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                />
                <button
                    type="button"
                    aria-label="Increment"
                    disabled={!canIncrement}
                    onClick={() => onChange(clamp(value + 1))}
                    style={stepButtonStyle(canIncrement)}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <line
                            x1="6"
                            y1="2.5"
                            x2="6"
                            y2="9.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <line
                            x1="2.5"
                            y1="6"
                            x2="9.5"
                            y2="6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </span>
        </label>
    );
}
