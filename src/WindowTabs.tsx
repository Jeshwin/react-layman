import {useAtomValue} from "jotai";
import {renderTabAtom} from "./Nexus";
import {VscClose} from "react-icons/vsc";
import {NexusKey} from "./types";
import {useDrag} from "react-dnd";

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
    const [{isDragging}, drag] = useDrag(() => ({
        type: "tab",
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    return (
        <div
            className="tab"
            draggable
            ref={drag}
            style={{
                display: isDragging ? "none" : "flex",
            }}
        >
            <button className="tab-selector" onClick={onClick}>
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
            <button className="tab-selector" onClick={onClick}>
                {renderTab(tab)}
            </button>
            <button className="close-tab" onClick={onDelete}>
                <VscClose color="white" />
            </button>
        </div>
    );
};
