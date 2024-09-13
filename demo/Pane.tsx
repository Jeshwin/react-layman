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
                    fontSize: 30,
                    lineHeight: "36px",
                }}
            >
                {paneId}
            </div>
            <div
                style={{
                    paddingTop: 16,
                    fontSize: 24,
                    color: "#d4d4d8",
                }}
            >
                Counter: {(counter / 10).toFixed(1)}s
            </div>
        </div>
    );
}
