import {MouseEventHandler, useState} from "react";
import {VscAdd} from "react-icons/vsc";

export function NewTabButton({
    onClick,
}: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHovering(true);
    };

    const handleMouseLeave: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHovering(false);
    };

    return (
        <button
            style={{
                width: 32,
                height: 32,
                display: "grid",
                placeContent: "center",
                backgroundColor: isHovering ? "#27272a" : "transparent",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            <VscAdd />
        </button>
    );
}

export function ToolbarButton({
    icon,
    onClick,
}: {
    icon: JSX.Element;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHovering(true);
    };

    const handleMouseLeave: MouseEventHandler<HTMLElement> = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        setIsHovering(false);
    };

    return (
        <button
            style={{
                width: 32,
                height: 32,
                display: "grid",
                placeContent: "center",
                backgroundColor: isHovering ? "#27272a" : "transparent",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {icon}
        </button>
    );
}
