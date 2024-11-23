import {useDrag} from "react-dnd";
import {useContext, useEffect} from "react";
import {LaymanContext, TabType, TabData, LaymanHeuristic} from "../../src";

export default function TabSource({tabName, heuristic}: {tabName: string; heuristic: LaymanHeuristic}) {
    const {setGlobalDragging, layoutDispatch} = useContext(LaymanContext);

    const [{isDragging}, drag] = useDrag({
        type: TabType,
        item: {
            path: undefined,
            tab: new TabData(tabName),
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    useEffect(() => {
        setGlobalDragging(isDragging);
    }, [isDragging, setGlobalDragging]);

    const handleDoubleClick = () => {
        // Add tab to the top left window
        layoutDispatch({
            type: "addTabWithHeuristic",
            tab: new TabData(tabName),
            heuristic: heuristic,
        });
    };

    return (
        <div
            ref={drag}
            className="tab-source"
            style={{
                width: 48,
                height: 48,
                display: "grid",
                placeContent: "center",
                textAlign: "center",
                borderRadius: 8,
                backgroundColor: "#babbf1",
                margin: 4,
                opacity: isDragging ? 0.5 : 1,
                cursor: "pointer",
            }}
            onDoubleClick={handleDoubleClick}
        >
            {tabName}
        </div>
    );
}
