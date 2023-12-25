import WindowManager from "./components/windowmanager"
import initialLayout from "./initialLayout.json"
import Basics from "./components/basics"

export default function App() {
    return (
        <div className="bg-slate-900">
            <div className="container py-16 mx-auto text-slate-50">
                <WindowManager initialLayout={initialLayout} />
            </div>
            <div className="container py-16 mx-auto text-sky-100">
                <Basics />
            </div>
        </div>
    )
}
