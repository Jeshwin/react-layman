import {useDraggable} from "@dnd-kit/core";

export default function Draggable({
    id,
    className,
    children,
}: {
    id: string;
    className: string;
    children: React.ReactNode;
}) {
    const {attributes, listeners, setNodeRef} = useDraggable({id});

    return (
        <div
            ref={setNodeRef}
            className={className}
            {...listeners}
            {...attributes}
        >
            {children}
        </div>
    );
}
