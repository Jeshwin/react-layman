import {useAtomValue} from "jotai";
import {renderTabAtom} from "./Nexus";
import {VscClose} from "react-icons/vsc";
import {NexusKey} from "./types";

export const NormalTab = ({
    tab,
    onClick,
    onDelete,
}: {
    tab: NexusKey;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}) => {
    const renderTab = useAtomValue(renderTabAtom).fn;
    return (
        <div className="tab">
            <button className="tab-selector" onMouseDown={onClick}>
                {renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose style={{fill: "#FFFFFF"}} />
            </button>
        </div>
    );
};

export const SelectedTab = ({
    tab,
    onClick,
    onDelete,
}: {
    tab: NexusKey;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    onDelete: React.MouseEventHandler<HTMLButtonElement>;
}) => {
    const renderTab = useAtomValue(renderTabAtom).fn;
    return (
        <div className="tab selected">
            <div className="indicator"></div>
            <button className="tab-selector" onMouseDown={onClick}>
                {renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </div>
    );
};
