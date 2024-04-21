export type NexusKey = string;
export type NexusKeys = NexusKey[];

export type NexusDirection = "column" | "row";

export type NexusBranch = "first" | "second";
export type NexusPath = NexusBranch[];

export type NexusLayout = NexusKeys | {
    direction: NexusDirection;
    first: NexusLayout;
    second: NexusLayout;
    splitPercentage?: number;
};

export type PaneRenderer = (arg0: NexusKey) => JSX.Element;
export type TabRenderer = (arg0: NexusKey) => string | JSX.Element;
