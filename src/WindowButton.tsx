export function ToolbarButton({
    icon,
    onClick,
}: {
    icon: JSX.Element;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
    return (
        <button className="toolbar-button" onClick={onClick}>
            {icon}
        </button>
    );
}
