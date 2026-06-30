import {useContext} from "react";
import {LaymanContext} from "../../src";
import Button from "./Button";

export default function AutoArrangButton() {
    const {layoutDispatch} = useContext(LaymanContext);

    const handleClick = () => {
        layoutDispatch({
            type: "autoArrange",
        });
    };

    return <Button onClick={handleClick}>Auto Arrange</Button>;
}
