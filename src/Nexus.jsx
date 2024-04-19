import {useRef} from "react";
import {LayoutProvider} from "./LayoutContext";
import LayoutRenderer from "./LayoutRenderer";

/**
 * @description Renders the main layout container of a Nexus application, providing context to child components for managing layouts and panes.
 * @component
 * @param {Object} props - Component props.
 * @param {Object|null} props.initialLayout - Initial layout state passed down from parent component.
 * @param {Function} props.renderPane - Function for rendering individual panes within the layout.
 * @param {Function} props.renderTab - Function for rendering tabs within the layout.
 * @return {JSX.Element} Rendered Nexus layout container with provided context.
 */
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
