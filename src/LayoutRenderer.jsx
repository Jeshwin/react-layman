import Separator from "./Separator";
import {Inset} from "./Insets";
import Window from "./Window";
import {useLayout} from "./LayoutContext";

export default function LayoutRenderer() {
    const {layout} = useLayout();
    const renderLayout = (node, inset, path) => {
        if (node === null) return;
        if (Array.isArray(node)) {
            return <Window inset={inset} path={path} />;
        } else if (typeof node === "object") {
            const {firstInset, secondInset} = inset.newInsets(
                node.splitPercentage ?? 50,
                node.direction
            );
            return (
                <>
                    {renderLayout(node.first, firstInset, path.concat("first"))}
                    <Separator
                        s
                        parentInset={inset}
                        splitPercentage={node.splitPercentage ?? 50}
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

    return renderLayout(layout, new Inset({}), []);
}
