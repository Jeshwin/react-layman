export type NexusKey = string;
export type NexusKeys = NexusKey[];

export type NexusDirection = "column" | "row";

export type NexusBranch = "first" | "second";
export type NexusPath = NexusBranch[];

export type NexusNode = {
    direction: NexusDirection;
    first: NexusLayout;
    second: NexusLayout;
    splitPercentage?: number;
}

export type NexusLayout = NexusKeys | NexusNode;
