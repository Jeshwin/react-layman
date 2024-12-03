import {Dispatch, SetStateAction} from "react";

export default function MutableToggle({
    mutable,
    setMutable,
}: {
    mutable: boolean;
    setMutable: Dispatch<SetStateAction<boolean>>;
}) {
    return (
        <label>
            <input type="checkbox" checked={mutable} onChange={() => setMutable(!mutable)} />
            <span>Mutable?</span>
        </label>
    );
}
