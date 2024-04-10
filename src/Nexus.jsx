import Separator from "./Separator";
import {Inset} from "./Insets";
import {useState} from "react";
import Window from "./Window";

export default function Nexus({initialLayout, renderPane}) {
    const [layout, setLayout] = useState(initialLayout);

    const renderLayout = (node, inset, path) => {
        if (node === null) return;
        if (Array.isArray(node)) {
            return (
                <Window
                    inset={inset}
                    ids={node}
                    renderPane={renderPane}
                    path={path}
                />
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
        <div className="w-full h-full relative overflow-hidden">
            {renderLayout(layout, new Inset({}), [])}
        </div>
    );
}
