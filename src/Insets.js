export class Inset {
    constructor({top, right, bottom, left}) {
        this.top = this.validateValue(top ?? 0);
        this.right = this.validateValue(right ?? 0);
        this.bottom = this.validateValue(bottom ?? 0);
        this.left = this.validateValue(left ?? 0);
    }

    // Helper method to ensure the value is between 0 and 100
    validateValue(value) {
        if (value < 0 || value > 100 || typeof value !== "number") {
            throw new Error("Value must be a number between 0 and 100");
        }
        return value;
    }

    // Method to return a string representation of the inset
    toString() {
        return `${this.top}% ${this.right}% ${this.bottom}% ${this.left}%`;
    }

    // Method to return an object representation of the inset
    toObject() {
        return {
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
        };
    }

    // Convert a relative percentage to an absolute percentage
    absoluteSplitPercentage(relativeSplitPercentage, direction) {
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

    // Convert an absolute percentage to a relative percentage
    relativeSplitPercentage(absoluteSplitPercentage, direction) {
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

    // Splits a parent inset into two child insets based on
    // split percentage and direction (either row or column)
    newInsets(splitPercentage, direction) {
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
