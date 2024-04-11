import {useEffect, useState} from "react";
import {separatorThickness} from "./constants";
import {useLayout} from "./LayoutContext";

export default function WindowToolbar({
    path,
    inset,
    selectedTabIndex,
    setSelectedTabIndex,
}) {
    const {layout, setLayout, addRow, addColumn} = useLayout();
    const [tabList, setTabList] = useState([]);
    const windowId = path.join(":");

    // On initial render, get tab list from layout using path
    useEffect(() => {
        let layoutClone = structuredClone(layout);
        let layoutTabList = layoutClone;
        for (const index of path) {
            layoutTabList = layoutTabList[index];
        }
        setTabList(layoutTabList);
    }, [layout, path, windowId]);

    const addBlankTab = () => {
        let layoutClone = structuredClone(layout);
        let layoutTabList = layoutClone;
        for (const index of path) {
            layoutTabList = layoutTabList[index];
        }
        layoutTabList.push("blank"); // Adds a blank tab
        console.dir(layoutClone);
        setLayout(layoutClone);
    };

    const removeTabAtIndex = (index) => {
        let layoutClone = structuredClone(layout);
        let layoutTabList = layoutClone;
        for (const index of path) {
            layoutTabList = layoutTabList[index];
        }
        layoutTabList.splice(index, 1); // Reomve tab and index
        // Edge case 2: Deleted tab left of selected tab
        if (index == selectedTabIndex) {
            setSelectedTabIndex(Math.max(0, index - 1));
        } else if (index < selectedTabIndex) {
            setSelectedTabIndex(selectedTabIndex - 1);
        } else {
            setSelectedTabIndex(selectedTabIndex);
        }

        console.log(windowId, " -> ", layoutTabList);
        if (layoutTabList.length === 0) {
            // Navigate to the parent node
            let parentPath = path.slice(0, -1);
            let parent = layoutClone;
            for (const idx of parentPath) {
                parent = parent[idx];
            }

            // Determine which side this node was on and its sibling
            const side = path[path.length - 1];
            const siblingSide = side === "first" ? "second" : "first";
            const sibling = parent[siblingSide];

            console.log(
                `Replacing ${parentPath.join(":")} with ${siblingSide} child`
            );
            console.log("Parent");
            console.dir(parent);
            console.log("Sibling");
            console.dir(sibling);

            // Replace the parent node with the sibling node
            if (parentPath.length > 0) {
                const grandParentPath = parentPath.slice(0, -1);
                let grandParent = layoutClone;
                for (const idx of grandParentPath) {
                    grandParent = grandParent[idx];
                }
                const parentSide = parentPath[parentPath.length - 1];
                grandParent[parentSide] = sibling;
            } else {
                // We're at the top level of layout
                layoutClone = sibling;
            }
        }

        console.log("Updated layout:", layoutClone);
        setLayout(layoutClone);
    };

    const idToTabName = (id) => {
        const idParts = id.split(":");
        const paneType = idParts[0];
        if (paneType === "file") {
            // Tab name should be file name
            const filePath = idParts[idParts.length - 1];
            // Get file name from full path
            const filePathParts = filePath.split("/");
            const fileName = filePathParts[filePathParts.length - 1];
            return fileName;
        } else {
            return paneType.charAt(0).toUpperCase() + paneType.slice(1);
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
                    {idToTabName(tab)}
                </button>
                <button
                    className="h-8 w-6 hover:bg-red-500 hover:bg-opacity-50 grid place-content-center"
                    onClick={() => removeTabAtIndex(index)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
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
                    {idToTabName(tab)}
                </button>
                <button
                    className="h-8 w-6 opacity-0 hover:opacity-100 grid place-content-center"
                    onClick={() => removeTabAtIndex(index)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
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
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                    />
                </svg>
            </button>
            {/** Draggable area to move window */}
            <div draggable className="flex-1 min-w-4 cursor-grab"></div>
            {/** Buttons to add convert window to a row or column */}
            <button
                className="w-8 h-8 hover:bg-zinc-800 grid place-content-center"
                onClick={() => addColumn(path)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 rotate-90"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"
                    />
                </svg>
            </button>
            <button
                className="w-8 h-8 rounded-tr hover:bg-zinc-800 grid place-content-center"
                onClick={() => addRow(path)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"
                    />
                </svg>
            </button>
        </div>
    );
}
