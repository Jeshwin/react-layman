import {useContext} from "react";
import {LaymanContext, TabData} from "../../src";

export default function NullLayout() {
    const {layoutDispatch} = useContext(LaymanContext);
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#51576d",
            }}
        >
            <div style={{margin: 16, fontSize: 32}}>Add a window to get started!</div>
            <button
                style={{
                    borderRadius: 8,
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    fontSize: 16,
                    backgroundColor: "#626880",
                }}
                onClick={() => {
                    layoutDispatch({
                        type: "addTab",
                        path: [],
                        tab: new TabData("blank"),
                    });
                }}
            >
                Add Window
            </button>
        </div>
    );
}
