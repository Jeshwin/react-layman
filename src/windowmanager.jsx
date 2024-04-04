import Mosaic from "./Mosaic";

export default function WindowManager() {
    // Variables for handlebar dimensions
    return (
        <Mosaic
            initialLayout={{
                direction: "row",
                first: {
                    text: "0",
                },
                second: {
                    direction: "column",
                    first: {
                        text: "1",
                    },
                    second: {
                        text: "2",
                    },
                },
                splitPercentage: 40,
            }}
        />
        // <div className="h-[calc(100vh-128px)] relative">
        //     <div
        //         id={nanoid()}
        //         style={{
        //             inset: "0% 50% 0% 0%",
        //             position: "absolute",
        //             margin: `${handleBarThickness / 2}px`,
        //         }}
        //         className="p-2 rounded-lg bg-zinc-800"
        //     >
        //         <div className="w-full h-full grid place-content-center text-center text-xl">
        //             {nanoid()}
        //         </div>
        //     </div>
        //     <div
        //         id={nanoid()}
        //         style={{
        //             inset: "0% 50% 0% 50%",
        //             position: "absolute",
        //             marginLeft: `-${handleBarThickness / 2}px`,
        //         }}
        //         className="w-2 z-10 grid place-content-center hover:cursor-ew-resize"
        //     >
        //         <div className="w-0.5 h-10 rounded-full bg-zinc-50"></div>
        //     </div>
        //     <div
        //         id={nanoid()}
        //         style={{
        //             inset: "0% 0% 50% 50%",
        //             position: "absolute",
        //             margin: `${handleBarThickness / 2}px`,
        //         }}
        //         className="p-2 rounded-lg bg-zinc-800"
        //     >
        //         <div className="w-full h-full grid place-content-center text-center text-xl">
        //             {nanoid()}
        //         </div>
        //     </div>
        //     <div
        //         id={nanoid()}
        //         style={{
        //             inset: "50% 0% 50% 50%",
        //             position: "absolute",
        //             marginTop: `-${handleBarThickness / 2}px`,
        //         }}
        //         className="h-2 z-10 grid place-content-center hover:cursor-ns-resize"
        //     >
        //         <div className="h-0.5 w-10 rounded-full bg-zinc-50"></div>
        //     </div>
        //     <div
        //         id={nanoid()}
        //         style={{
        //             inset: "50% 0% 0% 50%",
        //             position: "absolute",
        //             margin: `${handleBarThickness / 2}px`,
        //         }}
        //         className="p-2 rounded-lg bg-zinc-800"
        //     >
        //         <div className="w-full h-full grid place-content-center text-center text-xl">
        //             {nanoid()}
        //         </div>
        //     </div>
        // </div>
    );
}
