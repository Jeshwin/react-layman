import {useAtomValue} from "jotai";
import {renderTabAtom} from "./Nexus";
import {VscClose} from "react-icons/vsc";
import {NexusKey} from "./types";
import {MouseEventHandler, useState} from "react";

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
    const [isHoveringTab, setIsHoveringTab] = useState(false);
    const [isHoveringClose, setIsHoveringClose] = useState(false);

    const handleMouseEnterTab: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHoveringTab(true);
    };

    const handleMouseLeaveTab: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHoveringTab(false);
    };

    const handleMouseEnterClose: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHoveringClose(true);
    };

    const handleMouseLeaveClose: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHoveringClose(false);
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                width: "fit-content",
                backgroundColor: isHoveringTab ? "#3f3f46" : "#18181b",
            }}
            onMouseEnter={handleMouseEnterTab}
            onMouseLeave={handleMouseLeaveTab}
        >
            <button
                style={{padding: 8, fontSize: 14, lineHeight: 20}}
                onClick={onClick}
            >
                {renderTab(tab)}
            </button>
            <button
                style={{
                    display: "grid",
                    placeContent: "center",
                    width: 24,
                    height: 32,
                    opacity: isHoveringClose ? 1 : 0,
                }}
                onMouseEnter={handleMouseEnterClose}
                onMouseLeave={handleMouseLeaveClose}
                onClick={onDelete}
            >
                <VscClose />
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
    const [isHoveringClose, setIsHoveringClose] = useState(false);

    const handleMouseEnterClose: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHoveringClose(true);
    };

    const handleMouseLeaveClose: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHoveringClose(false);
    };

    return (
        <div
            style={{
                display: "flex",
                position: "relative",
                alignItems: "center",
                width: "fit-content",
                backgroundColor: "#27272a",
            }}
        >
            {/** Add selection border at top */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    left: 0,
                    height: 1,
                    backgroundColor: "#f97316",
                }}
            ></div>
            <button
                style={{padding: 8, fontSize: 14, lineHeight: 20}}
                onClick={onClick}
            >
                {renderTab(tab)}
            </button>
            <button
                style={{
                    display: "grid",
                    placeContent: "center",
                    width: 24,
                    height: 32,
                    backgroundColor: isHoveringClose
                        ? "#ef444488"
                        : "transparent",
                }}
                onMouseEnter={handleMouseEnterClose}
                onMouseLeave={handleMouseLeaveClose}
                onClick={onDelete}
            >
                <VscClose />
            </button>
        </div>
    );
};
