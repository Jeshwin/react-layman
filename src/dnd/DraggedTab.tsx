import {UniqueIdentifier} from "@dnd-kit/core";

export default function DraggedTab({tab}: {tab: UniqueIdentifier | null}) {
    return tab ? (
        <div
            style={{
                width: "fit-content",
                padding: "1rem",
                borderRadius: "0.25rem",
                backgroundColor: "yellow",
            }}
        >
            {tab}
        </div>
    ) : null;
}
