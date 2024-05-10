import {VscClose} from "react-icons/vsc";
import {LaymanKey} from "./types";
import {useContext} from "react";
import {LaymanContext} from "./LaymanContext";
import Draggable from "./dnd/Draggable";

export const NormalTab = ({
    tab,
    onClick,
    onDelete,
}: {
    tab: LaymanKey;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}) => {
    const laymanContext = useContext(LaymanContext);
    return (
        <Draggable id={tab} className="tab">
            <button className="tab-selector" onClick={onClick}>
                {laymanContext!.renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </Draggable>
    );
};

export const SelectedTab = ({
    tab,
    onClick,
    onDelete,
}: {
    tab: LaymanKey;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}) => {
    const laymanContext = useContext(LaymanContext);

    return (
        <Draggable id={tab} className="tab selected">
            <div className="indicator"></div>
            <button className="tab-selector" onClick={onClick}>
                {laymanContext!.renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </Draggable>
    );
};
