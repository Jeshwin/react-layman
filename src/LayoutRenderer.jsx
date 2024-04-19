import {useLayout} from "./LayoutContext";

export default function LayoutRenderer() {
    const {renderedLayout} = useLayout();

    return (
        renderedLayout ?? (
            <>
                {renderedLayout[0]}
                {renderedLayout[1]}
                {renderedLayout[2]}
            </>
        )
    );
}
