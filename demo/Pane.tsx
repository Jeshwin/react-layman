import {useState, useEffect, useContext} from "react";
import {useWindowContext} from "../src/WindowContext";
import {LaymanContext} from "../src";
import _ from "lodash";

// Example pane for testing re-renders
export default function Pane({paneId}: {paneId: string}) {
    // Get data from layout contexts
    const {position, path} = useWindowContext();
    const {layout} = useContext(LaymanContext);
    // Counter to keep track of how long the pane has been alive
    // Will reset when the pane is re-rendered!
    const [counter, setCounter] = useState(0);

    //! DEBUG
    // Get layout data using Lodash
    const lodashPath = "children." + path.join(".children.");
    const currentNode = _.get(layout, lodashPath);

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
            <pre
                style={{
                    borderRadius: 8,
                    backgroundColor: "#0a0a0a",
                    color: "#f5f5f4",
                    padding: 8,
                    textAlign: "left",
                }}
            >
                {JSON.stringify(
                    position,
                    (_key, value) => {
                        // Check if the value is a number, then round it to the nearest integer
                        return typeof value === "number" ? Math.round(value) : value;
                    },
                    2
                )}
            </pre>
            <div>{lodashPath}</div>
            <pre
                style={{
                    fontSize: 12,
                    height: 100,
                    overflowY: "scroll",
                    borderRadius: 8,
                    backgroundColor: "#0a0a0a",
                    color: "#f5f5f4",
                    padding: 8,
                    textAlign: "left",
                }}
            >
                {JSON.stringify(
                    currentNode,
                    (_key, value) => {
                        // Check if the value is a number, then round it to the nearest integer
                        return typeof value === "number" ? Math.round(value) : value;
                    },
                    2
                )}
            </pre>
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
