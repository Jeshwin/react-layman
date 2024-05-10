import {UniqueIdentifier} from "@dnd-kit/core";

export default function DraggedTab({tab}: {tab: UniqueIdentifier | null}) {
    return tab ? <div className="dragged-tab">{tab}</div> : null;
}
