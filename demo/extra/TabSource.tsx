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
                height: 32,
                minWidth: 32,
                paddingInline: 6,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                borderRadius: 8,
                backgroundColor: "#414559",
                border: "1px solid #626880",
                margin: "0 3px",
                opacity: isDragging ? 0.4 : 1,
                cursor: "grab",
                userSelect: "none",
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#c6d0f5",
                boxShadow: isDragging ? "none" : "0 1px 3px rgba(0,0,0,0.3)",
                transition: "opacity 0.15s, box-shadow 0.15s, background-color 0.15s",
            }}
            onDoubleClick={handleDoubleClick}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{opacity: 0.6, flexShrink: 0}}
            >
                <circle cx="12" cy="5" r="1" />
                <circle cx="19" cy="5" r="1" />
                <circle cx="5" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
                <circle cx="19" cy="19" r="1" />
                <circle cx="5" cy="19" r="1" />
            </svg>
            {tabName}
        </div>
    );
}
