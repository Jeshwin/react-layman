import {useState} from "react";
import {separatorThickness} from "./constants";
import {nanoid} from "nanoid";

export default function Window({ids, renderPane, inset, path}) {
    const [windowId, setWindowId] = useState(nanoid());
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    // Test tab data
    const tabs = [
        "file:257897c7-003e-5ce7-b718-2091010a6481:main.py",
        "file:afe200f7-301e-5820-b97b-ecbcebd13342:utils/rref.py",
        "shell:bc1232c5-f365-5212-b7a5-3ca1ed7f35be",
        "git:e69a4716-b15e-5975-b993-61a95009c670",
    ];

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

    return (
        <>
            <div
                key={windowId}
                style={{
                    inset: inset.toString(),
                    position: "absolute",
                    margin: `${separatorThickness / 2}px`,
                }}
                className="h-8 z-10 rounded-t bg-zinc-900 flex"
            >
                <div className="flex rounded-tl overflow-x-scroll overflow-y-clip">
                    {tabs.map((tab, index) => {
                        if (index == selectedTabIndex) {
                            return (
                                <div
                                    key={index}
                                    className="first:rounded-tl w-fit relative flex  items-center bg-zinc-800"
                                >
                                    {/** Add selection border at top */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-orange-500"></div>
                                    <button
                                        className="p-2 text-sm"
                                        onClick={() =>
                                            setSelectedTabIndex(index)
                                        }
                                    >
                                        {idToTabName(tab)}
                                    </button>
                                    <button className="h-8 w-6 hover:bg-red-500 hover:bg-opacity-50 grid place-content-center">
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
                        } else {
                            return (
                                <div
                                    key={index}
                                    className="first:rounded-tl w-fit flex items-center bg-zinc-900 hover:brightness-150"
                                >
                                    <button
                                        className="p-2 text-sm"
                                        onClick={() =>
                                            setSelectedTabIndex(index)
                                        }
                                    >
                                        {idToTabName(tab)}
                                    </button>
                                    <button className="h-8 w-6 opacity-0 hover:opacity-100 grid place-content-center">
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
                        }
                    })}
                </div>
                <div draggable className="flex-1 min-w-4 cursor-grab"></div>
                <button className=" rounded-tr hover:bg-zinc-800">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                        />
                    </svg>
                </button>
            </div>
            <div
                key={windowId}
                style={{
                    inset: inset.toString(),
                    position: "absolute",
                    margin: `${separatorThickness / 2}px`,
                }}
                className="rounded bg-zinc-800 overflow-hidden"
            >
                {renderPane(tabs[selectedTabIndex], path)}
            </div>
        </>
    );
}
