import WindowManager from "./components/windowmanager"
import initialLayout from "./initialLayout.json"
import Basics from "./components/basics"
import DragNDrop from "./components/dragndrop/dragndrop"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export default function App() {
    return (
        <div className="bg-slate-900">
            <div className="container py-16 mx-auto text-slate-50">
                <WindowManager initialLayout={initialLayout} />
            </div>
            <div className="container py-16 mx-auto text-slate-50">
                <Basics />
            </div>
            <DndProvider backend={HTML5Backend}>
                <div className="container py-16 mx-auto text-slate-50">
                    <DragNDrop />
                </div>
            </DndProvider>
        </div>
    )
}
