import {LayoutProvider} from "./LayoutContext";
import LayoutRenderer from "./LayoutRenderer";

export default function Nexus({initialLayout, renderPane}) {
    return (
        <LayoutProvider initialLayout={initialLayout} renderPane={renderPane}>
            <div className="w-full h-full relative overflow-hidden">
                <LayoutRenderer />
            </div>
        </LayoutProvider>
    );
}
