import {VscClose} from "react-icons/vsc";
import {useContext} from "react";
import {useDrag} from "react-dnd";
import {LaymanContext} from "./LaymanContext";
import {TabData} from "./TabData";
import {TabType} from "./types";

interface NormalTabProps {
    tab: TabData;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}

export const NormalTab = ({tab, onClick, onDelete}: NormalTabProps) => {
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
            className={`tab ${isDragging ? "dragging" : ""}`}
            style={{opacity: isDragging ? 0.5 : 1}}
        >
            <button className="tab-selector" onMouseDown={onClick}>
                {renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </div>
    );
};

interface SelectedTabProps {
    tab: TabData;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}

export const SelectedTab = ({tab, onDelete}: SelectedTabProps) => {
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
            className={`tab selected ${isDragging ? "dragging" : ""}`}
            style={{opacity: isDragging ? 0.5 : 1}}
        >
            <div className="indicator"></div>
            <button className="tab-selector">{renderTab(tab)}</button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </div>
    );
};
