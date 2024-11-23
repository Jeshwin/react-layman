import {LaymanProvider, LaymanLayout, Layman, TabData} from "../src";
import Pane from "./Pane";
import TabSource from "./extra/TabSource";
import NullLayout from "./extra/NullLayout";
import AutoArrangeButton from "./extra/AutoArrangeButton";

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
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <AutoArrangeButton />
                    <TabSource tabName={"A"} heuristic="topleft" />
                    <TabSource tabName={"B"} heuristic="topleft" />
                    <TabSource tabName={"C"} heuristic="topleft" />
                    <div style={{fontSize: 10}}>Top Left Heuristic</div>
                </div>
                <div style={{position: "relative", height: "calc(100vh - 64px)", display: "flex"}}>
                    <div
                        style={{
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: 64,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{fontSize: 10}}>Top Right Heuristic</div>
                        <TabSource tabName={"D"} heuristic="topright" />
                        <TabSource tabName={"E"} heuristic="topright" />
                        <TabSource tabName={"F"} heuristic="topright" />
                    </div>
                    <div
                        style={{
                            width: "calc(100vw - 64px)",
                            height: "calc(100vh - 64px)",
                        }}
                    >
                        <Layman />
                    </div>
                </div>
            </div>
        </LaymanProvider>
    );
}
