import {LaymanProvider, Layman, TabData} from "../src";
import Pane from "./Pane";
import TabSource from "./extra/TabSource";
import NullLayout from "./extra/NullLayout";
import AutoArrangeButton from "./extra/AutoArrangeButton";
import {LaymanLayout} from "../src";
import ResizeTester from "./extra/ResizeTester";

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

    return (
        <LaymanProvider
            initialLayout={initialLayout}
            renderPane={renderPane}
            renderTab={renderTab}
            renderNull={<NullLayout />}
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
                    <AutoArrangeButton />
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
                    <div
                        style={{
                            width: "100vw",
                            height: "calc(100vh - 64px)",
                            display: "flex",
                        }}
                    >
                        <ResizeTester />
                        <Layman />
                    </div>
                </div>
            </div>
        </LaymanProvider>
    );
}
