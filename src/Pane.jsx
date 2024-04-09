import {nanoid} from "nanoid";
import {useState} from "react";

export default function Pane({viewId}) {
    const [randomString, setRandomString] = useState(nanoid());
    return (
        <div className="w-full h-full m-2 grid place-content-center text-center text-xl">
            <span className="text-5xl">{viewId}</span>
            {randomString}
        </div>
    );
}
