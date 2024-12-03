import {useContext, useEffect} from "react";
import {ConnectDragSource, useDrag} from "react-dnd";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {TabType} from ".";
import {LaymanPath} from "./types";
import {VscClose} from "react-icons/vsc";

interface TabProps {
    tab: TabData;
    path: LaymanPath;
    isSelected: boolean;
    onMouseDown: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}

export const Tab = ({tab, path, isSelected, onDelete, onMouseDown}: TabProps) => {
    const {renderTab, setGlobalDragging, mutable} = useContext(LaymanContext);
    const [{isDragging}, drag] = useDrag({
        type: TabType,
        item: {
            path,
            tab,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    useEffect(() => {
        setGlobalDragging(isDragging);
    }, [isDragging, setGlobalDragging]);

    return (
        <div
            ref={drag}
            className={`tab ${isSelected ? "selected" : ""}`}
            style={{
                visibility: isDragging ? "hidden" : "visible",
                width: isDragging ? 0 : "auto",
            }}
        >
            {isSelected && <div className="indicator"></div>}
            <button className="tab-selector" onMouseDown={onMouseDown}>
                {renderTab(tab)}
            </button>
            {mutable && (
                <button className="close-tab" onClick={onDelete}>
                    <VscClose />
                </button>
            )}
        </div>
    );
};

interface SingleTabProps {
    dragRef: ConnectDragSource;
    tab: TabData;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
    onMouseDown: React.MouseEventHandler<HTMLButtonElement>;
}

export const SingleTab = ({dragRef, tab, onDelete, onMouseDown}: SingleTabProps) => {
    const {renderTab, mutable} = useContext(LaymanContext);

    return (
        <div ref={dragRef} className={`tab selected`}>
            <div className="indicator"></div>
            <button className="tab-selector" onMouseDown={onMouseDown}>
                {renderTab(tab)}
            </button>
            {mutable && (
                <button className="close-tab" onClick={onDelete}>
                    <VscClose />
                </button>
            )}
        </div>
    );
};
