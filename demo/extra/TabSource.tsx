import {useDrag} from "react-dnd";
import {useContext, useEffect} from "react";
import {LaymanHeuristic, LaymanContext, TabData, TabType} from "../../src";

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
            title={`Drag to place · Double-click to add to ${heuristic === "topleft" ? "top-left" : "top-right"}`}
            style={{
                height: 28,
                minWidth: 28,
                paddingInline: 10,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                borderRadius: 6,
                backgroundColor: "#414559",
                border: "1px solid #626880",
                margin: "0 3px",
                opacity: isDragging ? 0.4 : 1,
                cursor: "grab",
                userSelect: "none",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#c6d0f5",
                boxShadow: isDragging ? "none" : "0 1px 3px rgba(0,0,0,0.3)",
                transition: "opacity 0.15s, box-shadow 0.15s, background-color 0.15s",
            }}
            onDoubleClick={handleDoubleClick}
        >
            <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                style={{opacity: 0.6, flexShrink: 0}}
            >
                <circle cx="3" cy="2.5" r="1" fill="currentColor" />
                <circle cx="7" cy="2.5" r="1" fill="currentColor" />
                <circle cx="3" cy="5" r="1" fill="currentColor" />
                <circle cx="7" cy="5" r="1" fill="currentColor" />
                <circle cx="3" cy="7.5" r="1" fill="currentColor" />
                <circle cx="7" cy="7.5" r="1" fill="currentColor" />
            </svg>
            {tabName}
        </div>
    );
}
