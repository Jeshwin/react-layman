import {useLayout} from "./LayoutContext";
import {calculateComponents} from "./renderFunctions";

export default function LayoutRenderer() {
    const {layout} = useLayout();

    return <>{calculateComponents(layout)}</>;
}
