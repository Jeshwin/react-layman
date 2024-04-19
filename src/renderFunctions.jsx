import {Inset} from "./Insets";
import Separator from "./Separator";
import Window from "./Window";
import WindowToolbar from "./WindowToolbar";

export const calculateComponents = (layout) => {
    const separators = [];
    const toolbars = [];
    const panes = [];

    function traverseLayout(layout, inset, path) {
        if (layout.direction) {
            separators.push(
                <Separator
                    key={path.length != 0 ? path.join(":") : "root"}
                    parentInset={inset}
                    splitPercentage={layout.splitPercentage ?? 50}
                    direction={layout.direction}
                    path={path}
                />
            );
            const {firstInset, secondInset} = inset.newInsets(
                layout.splitPercentage ?? 50,
                layout.direction
            );
            traverseLayout(layout.first, firstInset, path.concat(["first"]));
            traverseLayout(layout.second, secondInset, path.concat(["second"]));
        } else {
            toolbars.push(
                <WindowToolbar
                    key={path.join(":")}
                    inset={inset}
                    path={path}
                    tabs={layout}
                />
            );
            layout.map((tab) =>
                panes.push(
                    <Window
                        key={path.join(":") + ":" + tab}
                        inset={inset}
                        tab={tab}
                        path={path}
                    />
                )
            );
        }
    }

    traverseLayout(layout, new Inset({}), []);
    return [separators, toolbars, panes];
};
