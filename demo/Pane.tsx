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
        <div id={paneId} className="pane">
            <div
                style={{
                    fontSize: 24,
                    lineHeight: "32px",
                    color: "#f5f5f4",
                }}
            >
                {paneId}
            </div>
            <div
                style={{
                    fontSize: 20,
                    lineHeight: "28px",
                    color: "#ef4444",
                }}
            >
                Counter: {(counter / 10).toFixed(1)}s
            </div>
        </div>
    );
}
