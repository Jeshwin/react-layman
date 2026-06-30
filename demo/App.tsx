import {LaymanLayout, LaymanProvider, Layman, TabData} from "../src";
import Pane from "./Pane";
import TabSource from "./extra/TabSource";
import NullLayout from "./extra/NullLayout";
import AutoArrangeButton from "./extra/AutoArrangeButton";
import Toggle from "./extra/Toggle";
import Button from "./extra/Button";
import NumberStepper from "./extra/NumberStepper";
import {useState} from "react";

export default function App() {
    const initialLayout: LaymanLayout = {
        direction: "row",
        children: [
            {
                direction: "column",
                children: [
                    {
                        tabs: [
                            new TabData("Home", {icon: "home-icon"}),
                            new TabData("Settings", {icon: "settings-icon"}),
                        ],
                        selectedIndex: 0,
                    },
                    {
                        tabs: [
                            new TabData("Profile", {icon: "profile-icon"}),
                            new TabData("Messages", {icon: "messages-icon"}),
                        ],
                        selectedIndex: 1,
                    },
                ],
            },
            {
                tabs: [new TabData("Dashboard", {icon: "dashboard-icon"})],
                selectedIndex: 0,
            },
        ],
    };
    /**
     * Transforms a given pane ID to its corresponding window component
     */
    const renderPane = (tab: TabData): JSX.Element => <Pane paneId={tab.id} />;

    /**
     * Transforms a given pane ID to its corresponding tab name
     * for display purposes.
     */
    const renderTab = (tab: TabData) => tab.name;

    // State to edit mutability of layout
    const [mutable, setMutable] = useState(true);

    // Demo-only: toggle a sidebar to exercise the layout's resize handling.
    const [showSidebar, setShowSidebar] = useState(false);

    // State to toggle between tab bar and compact window menu.
    const [showTabs, setShowTabs] = useState(false);

    // State to control the maximum split-nesting depth of the layout.
    const [maxDepth, setMaxDepth] = useState(4);

    const storageKey = "layman-demo-layout";
    const handleReset = () => {
        window.localStorage.removeItem(storageKey);
        window.location.reload();
    };

    return (
        <LaymanProvider
            initialLayout={initialLayout}
            renderPane={renderPane}
            renderTab={renderTab}
            renderNull={<NullLayout />}
            mutable={mutable}
            toolbarButtons={["splitBottom", "splitRight", "misc"]}
            storageKey={storageKey}
            showTabs={showTabs}
            maxDepth={maxDepth}
        >
            <div
                style={{
                    color: "#cdd6f4",
                    backgroundColor: "#232634",
                }}
            >
                <div
                    style={{
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: 64,
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            border: "1px solid #8aadf4",
                            borderRadius: 8,
                            padding: 8,
                            marginLeft: 8,
                            marginRight: 8,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <TabSource tabName={"A"} heuristic="topleft" />
                        <TabSource tabName={"B"} heuristic="topleft" />
                        <TabSource tabName={"C"} heuristic="topleft" />
                        <div>← Add to Top Left</div>
                    </div>
                    <div style={{display: "flex", justifyItems: "center", alignItems: "center"}}>
                        <AutoArrangeButton />
                        <Toggle checked={mutable} onCheck={() => setMutable(!mutable)} spanText="Mutable?" />
                        <Toggle checked={showTabs} onCheck={() => setShowTabs(!showTabs)} spanText="Show Tabs?" />
                        <Toggle
                            checked={showSidebar}
                            onCheck={() => setShowSidebar(!showSidebar)}
                            spanText="Sidebar?"
                        />
                        <NumberStepper label="Max Depth" value={maxDepth} onChange={setMaxDepth} min={1} max={10} />
                        <Button onClick={handleReset}>Reset Layout</Button>
                    </div>
                    <div
                        style={{
                            border: "1px solid #ee99a0",
                            borderRadius: 8,
                            padding: 8,
                            marginLeft: 8,
                            marginRight: 8,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <div>Add to Top Right →</div>
                        <TabSource tabName={"D"} heuristic="topright" />
                        <TabSource tabName={"E"} heuristic="topright" />
                        <TabSource tabName={"F"} heuristic="topright" />
                    </div>
                </div>
                <div style={{position: "relative", height: "calc(100vh - 64px)", display: "flex"}}>
                    {showSidebar && (
                        <div
                            style={{
                                width: 240,
                                flexShrink: 0,
                                height: "calc(100vh - 64px)",
                                backgroundColor: "#1e2030",
                                borderRight: "1px solid #494d64",
                                padding: 16,
                                boxSizing: "border-box",
                            }}
                        >
                            <h3 style={{marginTop: 0}}>Sidebar</h3>
                            <p>
                                Toggle me to verify the layout recomputes window geometry as the available container
                                width changes.
                            </p>
                        </div>
                    )}
                    <div
                        style={{
                            flex: 1,
                            minWidth: 0,
                            height: "calc(100vh - 64px)",
                            display: "flex",
                        }}
                    >
                        {/* <ResizeTester /> */}
                        <Layman />
                    </div>
                </div>
            </div>
        </LaymanProvider>
    );
}
