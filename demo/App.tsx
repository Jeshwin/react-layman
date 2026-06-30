import {LaymanLayout, LaymanProvider, Layman, TabData} from "../src";
import Pane from "./Pane";
import TabSource from "./extra/TabSource";
import NullLayout from "./extra/NullLayout";
import AutoArrangeButton from "./extra/AutoArrangeButton";
import Toggle from "./extra/Toggle";
import Button from "./extra/Button";
import NumberStepper from "./extra/NumberStepper";
import FloatingPanel from "./extra/FloatingPanel";
import {ReactNode, useState} from "react";

/** Labeled row used to group related controls inside the floating panel. */
function PanelSection({label, children}: {label: string; children: ReactNode}) {
    return (
        <div style={{display: "flex", flexDirection: "column", gap: 6}}>
            <span style={{fontSize: 11, fontWeight: 600, textTransform: "uppercase", opacity: 0.6}}>{label}</span>
            <div style={{display: "flex", alignItems: "center"}}>{children}</div>
        </div>
    );
}

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
            toolbarButtons={["splitBottom", "splitRight", "maximize"]}
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
                <FloatingPanel title="Layman Controls">
                    {/* Tab sources */}
                    <PanelSection label="Add to Top Left">
                        <TabSource tabName={"A"} heuristic="topleft" />
                        <TabSource tabName={"B"} heuristic="topleft" />
                        <TabSource tabName={"C"} heuristic="topleft" />
                    </PanelSection>
                    <PanelSection label="Add to Top Right">
                        <TabSource tabName={"D"} heuristic="topright" />
                        <TabSource tabName={"E"} heuristic="topright" />
                        <TabSource tabName={"F"} heuristic="topright" />
                    </PanelSection>

                    {/* Toggles */}
                    <Toggle checked={mutable} onCheck={() => setMutable(!mutable)} spanText="Mutable?" />
                    <Toggle checked={showTabs} onCheck={() => setShowTabs(!showTabs)} spanText="Show Tabs?" />
                    <Toggle
                        checked={showSidebar}
                        onCheck={() => setShowSidebar(!showSidebar)}
                        spanText="Sidebar?"
                    />

                    {/* Numeric input */}
                    <NumberStepper label="Max Depth" value={maxDepth} onChange={setMaxDepth} min={1} max={10} />

                    {/* Actions */}
                    <div style={{display: "flex", gap: 8, marginTop: 2}}>
                        <AutoArrangeButton />
                        <Button onClick={handleReset}>Reset Layout</Button>
                    </div>
                </FloatingPanel>

                <div style={{position: "relative", height: "100vh", display: "flex"}}>
                    {showSidebar && (
                        <div
                            style={{
                                width: 240,
                                flexShrink: 0,
                                height: "100vh",
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
                            height: "100vh",
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
