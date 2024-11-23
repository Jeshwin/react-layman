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
                backgroundColor: "#babbf1",
                margin: 4,
            }}
            onClick={handleClick}
        >
            Auto Arrange
        </button>
    );
}
