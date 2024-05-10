import {useDroppable} from "@dnd-kit/core";

export default function Droppable({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const {isOver, setNodeRef} = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: isOver ? "green" : undefined,
            }}
        >
            {children}
        </div>
    );
}
