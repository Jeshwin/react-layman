import {ReactNode} from "react";

export default function Button({onClick, children}: {onClick: () => void; children: ReactNode}) {
    return (
        <button
            style={{
                height: 32,
                paddingInline: 14,
                borderRadius: 6,
                border: "1px solid #626880",
                backgroundColor: "#414559",
                margin: "0 6px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#c6d0f5",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                transition: "background-color 0.15s, box-shadow 0.15s",
            }}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
