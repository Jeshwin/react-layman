export function ToolbarButton({
    children,
    ...props // Spread operator for capturing all additional props
}: React.ComponentProps<"button">) {
    return (
        <button className="toolbar-button" {...props}>
            {children}
        </button>
    );
}
