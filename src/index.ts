import "../styles/global.css";

export type {
    Children,
    LaymanDirection,
    LaymanPath,
    WindowAddress,
    FloatingWindowAddress,
    LaymanWindow,
    LaymanNode,
    LaymanLayout,
    LaymanState,
    FloatingWindowData,
    PaneRenderer,
    TabRenderer,
    LaymanContextType,
    LaymanHeuristic,
    LaymanLayoutAction,
    Position,
    DragData,
    ToolBarProps,
    WindowProps,
    SeparatorProps,
    LaymanSerializedLayout,
    LaymanSerializedNode,
    LaymanSerializedTab,
    LaymanSerializedWindow,
    LaymanSerializedFloatingWindow,
    LaymanSerializedState,
} from "./types";

export {TabData} from "./TabData";

export const TabType = "TAB";
export const WindowType = "WINDOW";

export {LaymanContext, LaymanProvider} from "./LaymanContext";
export {WindowContext, useWindowContext} from "./WindowContext";

export {Layman} from "./Layman";
export {Separator} from "./Separator";
export {Window} from "./Window";
export {ToolbarButton} from "./ToolbarButton";
export {WindowToolbar} from "./WindowToolbar";
export {Tab} from "./WindowTabs";
export {isFloatingAddress} from "./utils";
export {
    serializeLayout,
    deserializeLayout,
    deserializeTab,
    serializeFloatingWindow,
    deserializeFloatingWindow,
} from "./Serializer";
