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
    const {attributes, listeners, setNodeRef} = useDraggable({
        id,
    });
    // const style = transform
    //     ? {
    //           transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    //       }
    //     : undefined;

    return (
        <div
            ref={setNodeRef}
            // style={style}
            className={className}
            {...listeners}
            {...attributes}
        >
            {children}
        </div>
    );
}
