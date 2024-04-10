import {useState} from "react";
import {separatorThickness} from "./constants";
import WindowToolbar from "./WindowToolbar";
// import WindowDropTargets from "./WindowDropTargets";

export default function Window({tabs, renderPane, inset, path}) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    return (
        <>
            <WindowToolbar
                windowId={path.join(":")}
                inset={inset}
                tabs={tabs}
                selectedTabIndex={selectedTabIndex}
                setSelectedTabIndex={setSelectedTabIndex}
            />
            {tabs.map((tab, index) => (
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
