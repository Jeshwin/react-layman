import {useEffect, useState} from "react";
import {separatorThickness} from "./constants";
import WindowToolbar from "./WindowToolbar";
import {useLayout} from "./LayoutContext";
// import WindowDropTargets from "./WindowDropTargets";

export default function Window({inset, path}) {
    const {layout, renderPane} = useLayout();
    const [tabList, setTabList] = useState([]);
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    // On initial render, get tab list from layout using path
    useEffect(() => {
        let layoutClone = structuredClone(layout);
        let layouTabList = layoutClone;
        for (const index of path) {
            layouTabList = layouTabList[index];
        }
        setTabList(layouTabList);
    }, [layout, path]);

    return (
        <>
            <WindowToolbar
                inset={inset}
                path={path}
                selectedTabIndex={selectedTabIndex}
                setSelectedTabIndex={setSelectedTabIndex}
            />
            {tabList.map((tab, index) => (
                <div
                    key={index}
                    id={tab}
                    style={{
                        inset: inset.toString(),
                        position: "absolute",
                        margin: `${separatorThickness / 2}px`,
                    }}
                    className={`rounded bg-zinc-800 overflow-hidden ${
                        index == selectedTabIndex ? "visible" : "invisible"
                    }`}
                >
                    {renderPane(tab, path)}
                </div>
            ))}
            {/* <WindowDropTargets inset={inset} path={path} /> */}
        </>
    );
}
