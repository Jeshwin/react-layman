import {VscClose} from "react-icons/vsc";
import {useContext} from "react";
import {useDrag} from "react-dnd";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {TabType} from "./types";

interface TabProps {
    tab: TabData;
    isSelected: boolean;
    onMouseDown: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}

export const Tab = ({tab, isSelected, onDelete, onMouseDown}: TabProps) => {
    const {renderTab} = useContext(LaymanContext);
    const [{isDragging}, drag] = useDrag({
        type: TabType,
        item: tab,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={`tab ${isSelected ? "selected" : ""} ${
                isDragging ? "dragging" : ""
            }`}
            style={{
                visibility: isDragging ? "hidden" : "visible",
                width: isDragging ? 0 : "auto",
            }}
        >
            {isSelected && <div className="indicator"></div>}
            <button className="tab-selector" onMouseDown={onMouseDown}>
                {renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </div>
    );
};
