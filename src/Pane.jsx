import {useEffect, useState} from "react";

export default function Pane({paneId}) {
    const [paneType, setPaneType] = useState(null);

    useEffect(() => {
        setPaneType(paneId.split(":")[0]);
    }, [paneId]);

    return (
        <div className="w-full h-full m-2 grid place-content-center text-center text-xl">
            <span className="text-3xl">{paneId}</span>
            This is a {paneType} pane!
        </div>
    );
}
