export function ToolbarButton({
    children,
    ...props
}: React.ComponentProps<"button">) {
    return (
        <button className="toolbar-button" {...props}>
            {children}
        </button>
    );
}
