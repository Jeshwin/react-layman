import {useRef} from "react";
import {LayoutProvider} from "./LayoutContext";
import LayoutRenderer from "./LayoutRenderer";

export default function Nexus({initialLayout, renderPane, renderTab}) {
    const nexusRef = useRef(null);
    return (
        <div ref={nexusRef} className="w-full h-full relative overflow-hidden">
            <LayoutProvider
                initialLayout={initialLayout}
                renderPane={renderPane}
                renderTab={renderTab}
                nexusRef={nexusRef}
            >
                <LayoutRenderer />
            </LayoutProvider>
        </div>
    );
}
