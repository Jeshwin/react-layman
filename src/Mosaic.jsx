import Separator from "./Separator";
import {Inset} from "./Insets";
import Pane from "./Pane";
import {nanoid} from "nanoid";
import {useState} from "react";

export default function Nexus({initialLayout}) {
    const [layout, setLayout] = useState(initialLayout);

    const renderMosaic = (node, inset, path) => {
        if (node.direction) {
            const splitPercentage = node.splitPercentage ?? 50;
            const {firstInset, secondInset} = inset.newInsets(
                splitPercentage,
                node.direction
            );
            return (
                <>
                    {renderMosaic(node.first, firstInset, path.concat("first"))}
                    <Separator
                        layout={layout}
                        setLayout={setLayout}
                        parentInset={inset}
                        splitPercentage={splitPercentage}
                        direction={node.direction}
                        path={path}
                    />
                    {renderMosaic(
                        node.second,
                        secondInset,
                        path.concat("second")
                    )}
                </>
            );
        } else {
            return <Pane inset={inset} text={node.text + " : " + nanoid()} />;
        }
    };
    return (
        <div className="w-full h-full relative">
            {renderMosaic(layout, new Inset({}), [])}
        </div>
    );
}
