import {useState} from "react";

export default function ResizeTester() {
    const [width, setWidth] = useState(100);
    return (
        <div
            style={{
                width: width,
                border: "2px solid red",
                display: "grid",
                placeContent: "center",
            }}
        >
            <div style={{textAlign: "center", fontSize: 20, marginBottom: 16}}>Test Resizing!</div>
            <div
                style={{
                    display: "flex",
                }}
            >
                <button onClick={() => setWidth((oldWidth) => oldWidth + 10)}>Increase Width</button>
                <button onClick={() => setWidth((oldWidth) => oldWidth - 10)}>Decrease Width</button>
            </div>
        </div>
    );
}
