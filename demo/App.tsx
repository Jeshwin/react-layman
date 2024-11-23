import {LaymanProvider, LaymanLayout, Layman} from "../src";
import {TabData} from "../src/TabData";
import Pane from "./Pane";
import TabSource from "./extra/TabSource";

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
        <LaymanProvider initialLayout={initialLayout} renderPane={renderPane} renderTab={renderTab}>
            <div>
                <div
                    style={{
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: 64,
                        backgroundColor: "blue",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <TabSource tabName={"A"} />
                    <TabSource tabName={"B"} />
                    <TabSource tabName={"C"} />
                </div>
                <div style={{position: "relative", height: "calc(100vh - 64px)", display: "flex"}}>
                    <div
                        style={{
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: 64,
                            backgroundColor: "green",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <TabSource tabName={"D"} />
                        <TabSource tabName={"E"} />
                        <TabSource tabName={"F"} />
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
