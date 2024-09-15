import {v4 as uuidv4} from "uuid";

interface TabOptions {
    [key: string]: unknown; // Allows any custom data
}

export class TabData {
    // private UUID representing the tab
    id: string;

    // Is the tab currently selected in a window?
    isSelected: boolean;

    // Display name of tab
    public name: string;

    // Optional data attached to each tab
    public options: TabOptions;

    /** Creates an instance of the TabData class. */
    constructor(name: string, options: TabOptions = {}) {
        this.id = uuidv4();
        this.isSelected = false;
        this.name = name;
        this.options = options;
    }
}
