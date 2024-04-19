import {separatorThickness} from "./constants";

export default function WindowDropTargets({inset}) {
    const dropTargetClass =
        "z-20 rounded bg-orange-500 bg-opacity-50 border border-orange-500";
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    inset: inset.newInsets(50, "row").firstInset.toString(),
                    margin: `${separatorThickness / 2}px`,
                }}
                className={dropTargetClass}
            ></div>
            <div
                style={{
                    position: "absolute",
                    inset: inset.newInsets(50, "row").secondInset.toString(),
                    margin: `${separatorThickness / 2}px`,
                }}
                className={dropTargetClass}
            ></div>
            <div
                style={{
                    position: "absolute",
                    inset: inset.newInsets(50, "column").firstInset.toString(),
                    margin: `${separatorThickness / 2}px`,
                }}
                className={dropTargetClass}
            ></div>
            <div
                style={{
                    position: "absolute",
                    inset: inset.newInsets(50, "column").secondInset.toString(),
                    margin: `${separatorThickness / 2}px`,
                }}
                className={dropTargetClass}
            ></div>
        </>
    );
}
