import {useContext} from "react";
import {LaymanContext} from "../../src";

export default function AutoArrangButton() {
    const {layoutDispatch} = useContext(LaymanContext);

    const handleClick = () => {
        layoutDispatch({
            type: "autoArrange",
        });
    };

    return (
        <button
            style={{
                height: 32,
                borderRadius: 8,
                backgroundColor: "#7f849c",
                padding: 8,
                margin: 4,
                display: "grid",
                placeContent: "center",
                textAlign: "center",
                color: "white",
            }}
            onClick={handleClick}
        >
            Auto Arrange
        </button>
    );
}
