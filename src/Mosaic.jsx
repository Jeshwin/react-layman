import {nanoid} from "nanoid";

export default function Mosaic({initialLayout}) {
    const separatorThickness = 8;

    const calculateInsets = (initialInsets, splitPercentage, direction) => {
        console.log(
            "Splitting",
            initialInsets,
            `into a ${splitPercentage}-${100 - splitPercentage} ${direction}`
        );
        if (direction === "column") {
            const height = 100 - initialInsets.top - initialInsets.bottom;
            const newInsetValue =
                (height * splitPercentage) / 100 + initialInsets.top;
            console.dir({
                firstInsets: {
                    ...initialInsets,
                    bottom: 100 - newInsetValue,
                },
                secondInsets: {
                    ...initialInsets,
                    top: newInsetValue,
                },
            });
            return {
                firstInsets: {
                    ...initialInsets,
                    bottom: 100 - newInsetValue,
                },
                secondInsets: {
                    ...initialInsets,
                    top: newInsetValue,
                },
            };
        } else if (direction === "row") {
            const width = 100 - initialInsets.right - initialInsets.left;
            const newInsetValue =
                (width * splitPercentage) / 100 + initialInsets.left;
            console.dir({
                firstInsets: {
                    ...initialInsets,
                    right: 100 - newInsetValue,
                },
                secondInsets: {
                    ...initialInsets,
                    left: newInsetValue,
                },
            });
            return {
                firstInsets: {
                    ...initialInsets,
                    right: 100 - newInsetValue,
                },
                secondInsets: {
                    ...initialInsets,
                    left: newInsetValue,
                },
            };
        } else {
            return {
                first: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                second: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            };
        }
    };

    const insetToString = (insets) => {
        return `${insets.top}% ${insets.right}% ${insets.bottom}% ${insets.left}%`;
    };

    const Pane = ({insets, text}) => {
        return (
            <div
                id={nanoid()}
                style={{
                    inset: insetToString(insets),
                    position: "absolute",
                    margin: `${separatorThickness / 2}px`,
                }}
                className="p-2 rounded-lg bg-zinc-800"
            >
                <div className="w-full h-full grid place-content-center text-center text-xl">
                    {text}
                </div>
            </div>
        );
    };

    const Separator = ({insets, splitPercentage, direction}) => {
        if (direction === "column") {
            const height = 100 - insets.top - insets.bottom;
            const newInsetValue = (height * splitPercentage) / 100 + insets.top;
            const newInsets = {
                ...insets,
                top: newInsetValue,
                bottom: 100 - newInsetValue,
            };

            return (
                <div
                    id={nanoid()}
                    style={{
                        inset: insetToString(newInsets),
                        position: "absolute",
                        marginTop: `-${separatorThickness / 2}px`,
                    }}
                    className="h-2 z-10 grid place-content-center hover:cursor-ns-resize"
                >
                    <div className="h-0.5 w-10 rounded-full bg-zinc-50"></div>
                </div>
            );
        } else if (direction === "row") {
            const width = 100 - insets.right - insets.left;
            const newInsetValue = (width * splitPercentage) / 100 + insets.left;
            const newInsets = {
                ...insets,
                left: newInsetValue,
                right: 100 - newInsetValue,
            };
            return (
                <div
                    id={nanoid()}
                    style={{
                        inset: insetToString(newInsets),
                        position: "absolute",
                        marginLeft: `-${separatorThickness / 2}px`,
                    }}
                    className="w-2 z-10 grid place-content-center hover:cursor-ew-resize"
                >
                    <div className="w-0.5 h-10 rounded-full bg-zinc-50"></div>
                </div>
            );
        }
    };

    const renderMosaic = (
        node,
        insets = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        }
    ) => {
        if (node.direction) {
            const splitPercentage =
                node.splitPercentage == null ? 50 : node.splitPercentage;
            const {firstInsets, secondInsets} = calculateInsets(
                insets,
                splitPercentage,
                node.direction
            );
            return (
                <>
                    {renderMosaic(node.first, firstInsets)}
                    <Separator
                        insets={insets}
                        splitPercentage={splitPercentage}
                        direction={node.direction}
                    />
                    {renderMosaic(node.second, secondInsets)}
                </>
            );
        } else {
            return <Pane insets={insets} text={node.text} />;
        }
    };
    return (
        <div className="h-[calc(100vh-128px)] relative">
            {renderMosaic(initialLayout)}
        </div>
    );
}
