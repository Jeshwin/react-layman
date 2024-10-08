import {LaymanProvider, LaymanLayout, Layman} from "../src";
import {TabData} from "../src/TabData";
import Pane from "./Pane";

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
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeContent: "center",
                    backgroundColor: "#09090b",
                }}
            >
                <div
                    style={{
                        fontFamily: "monospace",
                        width: "calc(100vw - 16px",
                        height: "calc(100vh - 16px)",
                    }}
                >
                    <Layman />
                </div>
            </div>
        </LaymanProvider>
    );
}
