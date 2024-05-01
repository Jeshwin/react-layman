import {LaymanDirection} from "./types";

export interface InsetInput {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export class Inset {
    top: number;
    right: number;
    bottom: number;
    left: number;

    /**
     * Creates an instance of the Inset class with specified margins.
     * Each margin defaults to 0 if not provided.
     * @param params Object containing the top, right, bottom, and left values.
     */
    constructor(params: InsetInput) {
        this.top = this.validateValue(params.top ?? 0);
        this.right = this.validateValue(params.right ?? 0);
        this.bottom = this.validateValue(params.bottom ?? 0);
        this.left = this.validateValue(params.left ?? 0);
    }

    /**
     * Validates that the provided value is a number between 0 and 100.
     * @param value The value to validate.
     * @returns The validated number.
     * @throws Will throw an error if the value is not within the range or not a number.
     */
    private validateValue(value: number): number {
        if (typeof value !== "number") {
            throw new Error("Innset value must be a number");
        }
        return Math.max(0, Math.min(100, value));
    }

    /**
     * Converts the inset to a string format.
     * @returns A string representing the percentage values of the inset.
     */
    toString(): string {
        return `${this.top}% ${this.right}% ${this.bottom}% ${this.left}%`;
    }

    /**
     * Converts the inset to an object format.
     * @returns An object representing the inset percentages.
     */
    toObject(): {top: number; right: number; bottom: number; left: number} {
        return {
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
        };
    }

    /**
     * Converts a relative percentage to an absolute percentage based on the direction.
     * @param relativeSplitPercentage The percentage relative to the current free space.
     * @param direction The direction of the split, either "column" or "row".
     * @returns The absolute percentage position from the start of the element.
     * @throws Will throw an error if an invalid direction is provided.
     */
    absoluteSplitPercentage(
        relativeSplitPercentage: number,
        direction: LaymanDirection
    ): number {
        if (direction === "column") {
            const height = 100 - this.top - this.bottom;
            return (height * relativeSplitPercentage) / 100 + this.top;
        } else if (direction === "row") {
            const width = 100 - this.right - this.left;
            return (width * relativeSplitPercentage) / 100 + this.left;
        } else {
            throw new Error("Invalid direction. Expected 'column' or 'row'.");
        }
    }

    /**
     * Converts an absolute percentage to a relative percentage based on the direction.
     * @param absoluteSplitPercentage The absolute percentage position from the start of the element.
     * @param direction The direction of the split, either "column" or "row".
     * @returns The percentage relative to the current free space.
     * @throws Will throw an error if an invalid direction is provided.
     */
    relativeSplitPercentage(
        absoluteSplitPercentage: number,
        direction: LaymanDirection
    ): number {
        if (direction === "column") {
            const height = 100 - this.top - this.bottom;
            return ((absoluteSplitPercentage - this.top) / height) * 100;
        } else if (direction === "row") {
            const width = 100 - this.right - this.left;
            return ((absoluteSplitPercentage - this.left) / width) * 100;
        } else {
            throw new Error("Invalid direction. Expected 'column' or 'row'.");
        }
    }

    /**
     * Splits the inset into two based on a percentage and direction.
     * @param splitPercentage The percentage to split at.
     * @param direction The direction to split, either "column" or "row".
     * @returns Two new Insets as a result of the split.
     * @throws Will throw an error if an invalid direction is provided.
     */
    newInsets(
        splitPercentage: number,
        direction: LaymanDirection
    ): {firstInset: Inset; secondInset: Inset} {
        if (direction === "column") {
            const height = 100 - this.top - this.bottom;
            const newInsetValue = (height * splitPercentage) / 100 + this.top;
            return {
                firstInset: new Inset({
                    top: this.top,
                    right: this.right,
                    bottom: 100 - newInsetValue,
                    left: this.left,
                }),
                secondInset: new Inset({
                    top: newInsetValue,
                    right: this.right,
                    bottom: this.bottom,
                    left: this.left,
                }),
            };
        } else if (direction === "row") {
            const width = 100 - this.right - this.left;
            const newInsetValue = (width * splitPercentage) / 100 + this.left;
            return {
                firstInset: new Inset({
                    top: this.top,
                    right: 100 - newInsetValue,
                    bottom: this.bottom,
                    left: this.left,
                }),
                secondInset: new Inset({
                    top: this.top,
                    right: this.right,
                    bottom: this.bottom,
                    left: newInsetValue,
                }),
            };
        } else {
            throw new Error("Invalid direction. Expected 'column' or 'row'.");
        }
    }
}
