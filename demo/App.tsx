import {LaymanProvider, LaymanLayout, Layman} from "../src";
import {TabData} from "../src/TabData";
import Pane from "./Pane";

/**
 * @function App
 * @description The main functional component of the application, rendering the Layman layout manager
 * with the provided initial data and custom renderers for tabs and panes.
 * @returns {JSX.Element} The React component tree structure representing the entire application.
 */
export default function App() {
    const initialLayout: LaymanLayout = {
        direction: "row",
        first: [new TabData("explorer")],
        second: {
            direction: "column",
            first: [
                new TabData("file:main.py"),
                new TabData("file:utils/rref.py"),
                new TabData("file:api/auth/passwd.py"),
            ],
            second: [
                new TabData("console"),
                new TabData("shell:0"),
                new TabData("shell:1"),
            ],
            splitPercentage: 80,
        },
        splitPercentage: 20,
    };
    /**
     * @function renderPane
     * @description Transforms a given pane ID to its corresponding window component
     */
    const renderPane = (tab: TabData): JSX.Element => <Pane paneId={tab.id} />;

    /**
     * @function renderTab
     * @description Transforms a given pane ID to its corresponding tab name for display purposes.
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
                        color: "white",
                        width: "calc(100vw - 16px)",
                        height: "calc(100vh - 16px)",
                    }}
                >
                    <Layman />
                </div>
            </div>
        </LaymanProvider>
    );
}
