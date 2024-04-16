import {useCallback, useEffect, useState} from "react";
import {
    VscAdd,
    VscClose,
    VscSplitHorizontal,
    VscSplitVertical,
} from "react-icons/vsc";
import {separatorThickness} from "./constants";
import {useLayout} from "./LayoutContext";
import {stringToUUID} from "./renderFunctions";

export default function WindowToolbar({
    path,
    inset,
    tabs,
    selectedTabIds,
    setSelectedTabIds,
}) {
    const {renderTab, addGeneralWindow, addTab, removeTab} = useLayout();
    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    const indexToTabId = useCallback(
        (index) => stringToUUID(path.join(":") + tabs[index]),
        [path, tabs]
    );

    useEffect(() => {
        setSelectedTabIds((prevSelectedTabIds) =>
            !prevSelectedTabIds.includes(indexToTabId(currentTabIndex))
                ? [...prevSelectedTabIds, indexToTabId(currentTabIndex)]
                : prevSelectedTabIds
        );
    }, [currentTabIndex, indexToTabId, path, setSelectedTabIds, tabs]);

    const addBlankTab = () => {
        addTab(path, "blank");
    };

    const removeTabAtIndex = (index) => {
        removeTab(path, index);

        // Remove tab from list of selected tabs, since it doesn't exist anymore
        setSelectedTabIds((prevSelectedTabIds) =>
            prevSelectedTabIds.filter((tab) => tab !== indexToTabId(index))
        );

        // Edge cases: Deleted tab left of selected tab
        if (index == currentTabIndex) {
            setCurrentTabIndex(Math.max(0, index - 1));
        } else if (index < currentTabIndex) {
            setCurrentTabIndex(currentTabIndex - 1);
        } else {
            setCurrentTabIndex(currentTabIndex);
        }
    };

    const handleClickTab = (index) => {
        // Remove previously selected tab from selected tabs
        setSelectedTabIds((prevSelectedTabIds) =>
            prevSelectedTabIds.filter(
                (tab) => tab !== indexToTabId(currentTabIndex)
            )
        );
        setCurrentTabIndex(index);
    };

    const SelectedTab = ({tab, index}) => {
        return (
            <div className="first:rounded-tl w-fit relative flex  items-center bg-zinc-800">
                {/** Add selection border at top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-orange-500"></div>
                <button className="p-2 text-sm">{renderTab(tab)}</button>
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
                    onClick={() => handleClickTab(index)}
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
            id={stringToUUID(path.join(":"))}
            style={{
                inset: inset.toString(),
                position: "absolute",
                margin: `${separatorThickness / 2}px`,
                marginBottom: 0,
            }}
            className="h-8 z-10 rounded-t bg-zinc-900 flex"
        >
            {/** Render each tab */}
            <div className="flex rounded-tl overflow-x-scroll overflow-y-clip">
                {tabs.map((tab, index) => {
                    if (selectedTabIds.includes(indexToTabId(index))) {
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
                onClick={() =>
                    addGeneralWindow("column", "second", ["blank"], path)
                }
            >
                <VscSplitVertical />
            </button>
            <button
                className="w-8 h-8 rounded-tr hover:bg-zinc-800 grid place-content-center"
                onClick={() =>
                    addGeneralWindow("row", "second", ["blank"], path)
                }
            >
                <VscSplitHorizontal />
            </button>
        </div>
    );
}
