import {useState, useEffect} from "react";

export default function Pane({paneId}) {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCounter((prevCounter) => prevCounter + 1);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            id={paneId}
            className="w-full h-full m-2 grid place-content-center text-center text-xl relative"
        >
            <div className="absolute top-0 left-0 m-2 text-sm font-mono text-zinc-400">
                Counter: {(counter / 10).toFixed(1)}s
            </div>
            <span className="text-3xl">{paneId}</span>
            This is a {paneId.split(":")[0]} pane!
        </div>
    );
}
