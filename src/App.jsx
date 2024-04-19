import Nexus from "./Nexus";
import Pane from "./Pane";
import initialLayout from "./startingLayout.json";

/**
 * @function App
 * @description The main functional component of the application, rendering the Nexus layout manager
 * with the provided initial data and custom renderers for tabs and panes.
 * @returns {JSX.Element} The React component tree structure representing the entire application.
 */
export default function App() {
    /**
     * @function renderPane
     * @description Transforms a given pane ID to its corresponding window component
     * @param {string} id - The unique identifier of the pane.
     * @return {ReactJSX.Element} The window component based on the given pane ID.
     */
    const renderPane = (id) => <Pane paneId={id} />;

    /**
     * @function renderTab
     * @description Transforms a given pane ID to its corresponding tab name for display purposes.
     * @param {string} id - The unique identifier of the pane.
     * @return {string} The tab name based on the given pane ID.
     */
    const renderTab = (id) => {
        const idParts = id.split(":");
        const paneType = idParts[0];
        if (paneType === "file") {
            const filePathParts = idParts[idParts.length - 1].split("/");
            const fileName = filePathParts[filePathParts.length - 1];
            return fileName;
        } else {
            return paneType.charAt(0).toUpperCase() + paneType.slice(1);
        }
    };

    return (
        <div className="bg-zinc-950 grid place-content-center">
            <div className="w-screen h-screen p-16 text-white">
                <Nexus
                    initialLayout={initialLayout}
                    renderPane={renderPane}
                    renderTab={renderTab}
                />
            </div>
        </div>
    );
}
