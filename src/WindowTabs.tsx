import {VscClose} from "react-icons/vsc";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import {useDraggable} from "@dnd-kit/core";
import {TabData} from "./TabData";

export const NormalTab = ({
    tab,
    onClick,
    onDelete,
}: {
    tab: TabData;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}) => {
    const {renderTab} = useContext(LaymanContext);
    return (
        <div className="tab">
            <button className="tab-selector" onMouseDown={onClick}>
                {renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </div>
    );
};

export const SelectedTab = ({
    tab,
    onDelete,
}: {
    tab: TabData;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}) => {
    const {renderTab} = useContext(LaymanContext);
    const {attributes, listeners, setNodeRef} = useDraggable({
        id: tab.id,
    });

    return (
        <div ref={setNodeRef} className="tab selected">
            <div className="indicator"></div>
            <button {...listeners} {...attributes} className="tab-selector">
                {renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </div>
    );
};
