import Mosaic from "./Mosaic";
import initialLayout from "./startingLayout.json";

export default function App() {
    return (
        <div className="bg-zinc-950 grid place-content-center">
            <div className="w-screen h-screen p-16 text-white">
                <Mosaic initialLayout={initialLayout} />
            </div>
        </div>
    );
}
