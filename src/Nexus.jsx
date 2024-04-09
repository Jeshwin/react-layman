import Separator from "./Separator";
import {Inset} from "./Insets";
import {useState} from "react";
import {separatorThickness} from "./constants";

export default function Nexus({initialLayout, renderPane}) {
    const [layout, setLayout] = useState(initialLayout);

    const renderLayout = (node, inset, path) => {
        if (node === null) return;
        if (Array.isArray(node)) {
            const id = node[0];
            return (
                <>
                    <div
                        key={id}
                        style={{
                            inset: inset.toString(),
                            position: "absolute",
                            margin: `${separatorThickness / 2}px`,
                        }}
                        className="h-8 z-10 rounded-t-lg bg-zinc-900 overflow-hidden"
                    ></div>
                    <div
                        key={id}
                        style={{
                            inset: inset.toString(),
                            position: "absolute",
                            margin: `${separatorThickness / 2}px`,
                        }}
                        className="rounded-lg bg-zinc-800 overflow-hidden"
                    >
                        {renderPane(id, path)}
                    </div>
                </>
            );
        } else if (typeof node === "object") {
            const splitPercentage = node.splitPercentage ?? 50;
            const {firstInset, secondInset} = inset.newInsets(
                splitPercentage,
                node.direction
            );
            return (
                <>
                    {renderLayout(node.first, firstInset, path.concat("first"))}
                    <Separator
                        layout={layout}
                        setLayout={setLayout}
                        parentInset={inset}
                        splitPercentage={splitPercentage}
                        direction={node.direction}
                        path={path}
                    />
                    {renderLayout(
                        node.second,
                        secondInset,
                        path.concat("second")
                    )}
                </>
            );
        } else {
            throw new Error("Unknown element inside layout object");
        }
    };
    return (
        <div className="w-full h-full relative">
            {renderLayout(layout, new Inset({}), [])}
        </div>
    );
}
