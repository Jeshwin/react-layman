import Nexus from "./Nexus";
import Pane from "./Pane";
import initialLayout from "./startingLayout.json";

export default function App() {
    return (
        <div className="bg-zinc-950 grid place-content-center">
            <div className="w-screen h-screen p-16 text-white">
                <Nexus
                    initialLayout={initialLayout}
                    renderPane={(id) => <Pane paneId={id} />}
                />
            </div>
        </div>
    );
}
