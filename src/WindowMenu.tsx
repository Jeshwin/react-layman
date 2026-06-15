import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import {ToolbarButton} from "./ToolbarButton";
import {TabData} from "./TabData";
import {AddIcon, CloseIcon, EllipsisIcon} from "./Icons";
import {LaymanPath, Position} from "./types";

interface WindowMenuProps {
    path: LaymanPath;
    position: Position;
    tabs: TabData[];
    selectedIndex: number;
    open: boolean;
    setOpen: (open: boolean) => void;
    // Pre-rendered window control buttons (maximize/float/close/etc.).
    controlButtons: React.ReactNode;
}

/**
 * Compact window controls used when `showTabs` is false. Renders a single
 * square ellipsis button in the window's top-right corner; clicking it opens a
 * popover that exposes tab selection, adding tabs, and the window control
 * buttons that would otherwise live in the toolbar.
 */
export function WindowMenu({path, position, tabs, selectedIndex, open, setOpen, controlButtons}: WindowMenuProps) {
    const {layoutDispatch, renderTab, mutable} = useContext(LaymanContext);

    const cssToolbarHeight =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64;
    const separatorThickness =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;

    const buttonSize = cssToolbarHeight;

    return (
        <div
            className="layman-window-menu"
            style={{
                position: "absolute",
                top: position.top + separatorThickness / 2,
                left: position.left + position.width - buttonSize - separatorThickness,
                zIndex: 8,
            }}
        >
            <ToolbarButton
                className="toolbar-button layman-window-menu-trigger"
                onClick={() => setOpen(!open)}
                style={{width: buttonSize, height: buttonSize}}
            >
                <EllipsisIcon />
            </ToolbarButton>
            {open && (
                <div className="layman-window-menu-popover">
                    {tabs.length > 1 && (
                        <div className="layman-window-menu-tabs">
                            {tabs.map((tab, index) => (
                                <div
                                    key={tab.id}
                                    className={`layman-window-menu-tab ${index === selectedIndex ? "selected" : ""}`}
                                >
                                    <button
                                        className="tab-selector"
                                        onMouseDown={() => {
                                            layoutDispatch({type: "selectTab", path, tab});
                                            setOpen(false);
                                        }}
                                    >
                                        {renderTab(tab)}
                                    </button>
                                    {mutable && (
                                        <button
                                            className="close-tab"
                                            onClick={() => layoutDispatch({type: "removeTab", path, tab})}
                                        >
                                            <CloseIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="layman-window-menu-controls">
                        <ToolbarButton
                            onClick={() => {
                                const newTab = new TabData("blank");
                                layoutDispatch({type: "addTab", path, tab: newTab});
                                layoutDispatch({type: "selectTab", path, tab: newTab});
                            }}
                        >
                            <AddIcon />
                        </ToolbarButton>
                        {controlButtons}
                    </div>
                </div>
            )}
        </div>
    );
}
