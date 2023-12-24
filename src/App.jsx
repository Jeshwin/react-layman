import WindowManager from "./components/windowmanager"
import initialLayout from "./initialLayout.json"

export default function App() {
    return (
        <div className="bg-slate-900 py-16">
            <div className="container mx-auto text-slate-50">
                <WindowManager initialLayout={initialLayout} />
            </div>
        </div>
    )
}
