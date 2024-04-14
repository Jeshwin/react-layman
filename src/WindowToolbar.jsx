import {useEffect, useState} from "react";
import {
    VscAdd,
    VscClose,
    VscSplitHorizontal,
    VscSplitVertical,
} from "react-icons/vsc";
import {separatorThickness} from "./constants";
import {useLayout} from "./LayoutContext";

export default function WindowToolbar({
    path,
    inset,
    selectedTabIndex,
    setSelectedTabIndex,
}) {
    const {renderTab, layout, addRow, addColumn, addTab, removeTab} =
        useLayout();
    const [tabList, setTabList] = useState([]);
    const windowId = path.join(":");

    // get tabList whenever it changed
    useEffect(() => {
        let layoutClone = structuredClone(layout);
        let layoutTabList = layoutClone;
        for (const index of path) {
            layoutTabList = layoutTabList[index];
        }
        setTabList(layoutTabList);
    }, [layout, path]);

    const addBlankTab = () => {
        addTab(path, "blank");
    };

    const removeTabAtIndex = (index) => {
        removeTab(path, index);

        // Edge cases: Deleted tab left of selected tab
        if (index == selectedTabIndex) {
            setSelectedTabIndex(Math.max(0, index - 1));
        } else if (index < selectedTabIndex) {
            setSelectedTabIndex(selectedTabIndex - 1);
        } else {
            setSelectedTabIndex(selectedTabIndex);
        }
    };

    const SelectedTab = ({tab, index}) => {
        return (
            <div className="first:rounded-tl w-fit relative flex  items-center bg-zinc-800">
                {/** Add selection border at top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-orange-500"></div>
                <button
                    className="p-2 text-sm"
                    onClick={() => setSelectedTabIndex(index)}
                >
                    {renderTab(tab)}
                </button>
                <button
                    className="h-8 w-6 hover:bg-red-500 hover:bg-opacity-50 grid place-content-center"
                    onClick={() => removeTabAtIndex(index)}
                >
                    <VscClose />
                </button>
            </div>
        );
    };

    const NormalTab = ({tab, index}) => {
        return (
            <div className="first:rounded-tl w-fit flex items-center bg-zinc-900 hover:brightness-150">
                <button
                    className="p-2 text-sm"
                    onClick={() => setSelectedTabIndex(index)}
                >
                    {renderTab(tab)}
                </button>
                <button
                    className="h-8 w-6 opacity-0 hover:opacity-100 grid place-content-center"
                    onClick={() => removeTabAtIndex(index)}
                >
                    <VscClose />
                </button>
            </div>
        );
    };

    return (
        <div
            id={windowId}
            style={{
                inset: inset.toString(),
                position: "absolute",
                margin: `${separatorThickness / 2}px`,
            }}
            className="h-8 z-10 rounded-t bg-zinc-900 flex"
        >
            {/** Render each tab */}
            <div className="flex rounded-tl overflow-x-scroll overflow-y-clip">
                {tabList.map((tab, index) => {
                    if (index == selectedTabIndex) {
                        return (
                            <SelectedTab key={index} tab={tab} index={index} />
                        );
                    } else {
                        return (
                            <NormalTab key={index} tab={tab} index={index} />
                        );
                    }
                })}
            </div>
            {/** Button to add a new blank menu */}
            <button
                className="h-8 w-8 hover:bg-zinc-800 grid place-content-center"
                onClick={() => {
                    console.log("Adding a blank tab");
                    addBlankTab();
                }}
            >
                <VscAdd />
            </button>
            {/** Draggable area to move window */}
            <div draggable className="flex-1 min-w-4 cursor-grab"></div>
            {/** Buttons to add convert window to a row or column */}
            <button
                className="w-8 h-8 hover:bg-zinc-800 grid place-content-center"
                onClick={() => addColumn(path)}
            >
                <VscSplitVertical />
            </button>
            <button
                className="w-8 h-8 rounded-tr hover:bg-zinc-800 grid place-content-center"
                onClick={() => addRow(path)}
            >
                <VscSplitHorizontal />
            </button>
        </div>
    );
}
