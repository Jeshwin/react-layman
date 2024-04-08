import {nanoid} from "nanoid";
import {separatorThickness} from "./constants";

export default function Pane({inset, text}) {
    return (
        <div
            id={nanoid()}
            style={{
                inset: inset.toString(),
                position: "absolute",
                margin: `${separatorThickness / 2}px`,
            }}
            className="p-2 rounded-lg bg-zinc-800 overflow-hidden"
        >
            <div className="w-full h-full grid place-content-center text-center text-xl">
                {text}
            </div>
        </div>
    );
}
