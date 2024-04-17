import {Inset} from "./Insets";
import Separator from "./Separator";
import Window from "./Window";
import WindowToolbar from "./WindowToolbar";
import crypto from "node:crypto";

export const calculateSeparators = (layout) => {
    const separators = [];

    function traverseLayout(layout, inset, path) {
        if (!layout.direction) return;
        separators.push(
            <Separator
                key={stringToUUID(path.join(":"))}
                parentInset={inset}
                splitPercentage={layout.splitPercentage ?? 50}
                direction={layout.direction}
                path={path}
            />
        );
        const {firstInset, secondInset} = inset.newInsets(
            layout.splitPercentage ?? 50,
            layout.direction
        );
        traverseLayout(layout.first, firstInset, path.concat(["first"]));
        traverseLayout(layout.second, secondInset, path.concat(["second"]));
    }

    traverseLayout(layout, new Inset({}), []);
    return separators;
};

export const calculateWindows = (layout, selectedTabIds, setSelectedTabIds) => {
    const toolbars = [];
    const panes = [];

    function traverseLayout(layout, inset, path) {
        if (layout.direction) {
            const {firstInset, secondInset} = inset.newInsets(
                layout.splitPercentage ?? 50,
                layout.direction
            );
            traverseLayout(layout.first, firstInset, path.concat(["first"]));
            traverseLayout(layout.second, secondInset, path.concat(["second"]));
        } else {
            toolbars.push(
                <WindowToolbar
                    inset={inset}
                    path={path}
                    tabs={layout}
                    selectedTabIds={selectedTabIds}
                    setSelectedTabIds={setSelectedTabIds}
                />
            );
            layout.map((tab) =>
                panes.push(
                    <Window
                        key={stringToUUID(path.join(":") + tab)}
                        inset={inset}
                        tab={tab}
                        path={path}
                        selectedTabIds={selectedTabIds}
                    />
                )
            );
        }
    }

    traverseLayout(layout, new Inset({}), []);
    return [toolbars, panes];
};
export const stringToUUID = (str) => {
    // Encode the input string as UTF-8 and hash the data using SHA-256
    const hashWordArray = crypto.SHA256(str);

    // Convert words to hex string
    const hashHex = hashWordArray.toString(crypto.enc.Hex);

    // Extract 32 characters from the hash to fit the UUID format
    const uuidPart = hashHex.slice(0, 32);

    // Insert hyphens to conform to UUID format: 8-4-4-4-12
    const uuid = `${uuidPart.slice(0, 8)}-${uuidPart.slice(
        8,
        12
    )}-${uuidPart.slice(12, 16)}-${uuidPart.slice(16, 20)}-${uuidPart.slice(
        20,
        32
    )}`;

    return uuid;
};
