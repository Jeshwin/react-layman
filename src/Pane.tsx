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
            <div className="debug-timer">
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
