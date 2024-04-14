import Nexus from "./Nexus";
import Pane from "./Pane";
import initialLayout from "./startingLayout.json";

export default function App() {
    const idToTabName = (id) => {
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
                    renderPane={(id) => <Pane paneId={id} />}
                    renderTab={idToTabName}
                />
            </div>
        </div>
    );
}
