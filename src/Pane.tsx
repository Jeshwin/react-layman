import {useState, useEffect} from "react";

// Example pane for testing re-renders
export default function Pane({paneId}: {paneId: string}) {
    // Counter to keep track of how long the pane has been alive
    // Will reset when the pane is re-rendered!
    const [counter, setCounter] = useState(0);

    // Increment the counter every 100 ms
    useEffect(() => {
        const timer = setInterval(() => {
            setCounter((prevCounter) => prevCounter + 1);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            id={paneId}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "grid",
                placeContent: "center",
                margin: 8,
                textAlign: "center",
                fontSize: 16,
                lineHeight: "20px",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    margin: 8,
                    fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
                    color: "#d4d4d8",
                }}
            >
                {/** Display alive time as xx.x seconds */}
                Counter: {(counter / 10).toFixed(1)}s
            </div>
            <span
                style={{
                    fontSize: 30,
                    lineHeight: "36px",
                }}
            >
                {paneId}
            </span>
            This is a {paneId.split(":")[0]} pane!
        </div>
    );
}
