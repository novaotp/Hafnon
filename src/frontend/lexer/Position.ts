
export class Position {
    private defaultColumn: number;
    public column: number;
    public line: number;

    constructor(column: number, line: number) {
        this.defaultColumn = column;
        this.column = column;
        this.line = line;
    }

    public nextColumn(): void {
        this.column += 1;
    }

    /** Also resets the column. */
    public nextLine(): void {
        this.line += 1;
        this.column = this.defaultColumn;
    }

    public clone(): Position {
        return new Position(this.column, this.line);
    }

    public toString(): string {
        return `(column: ${this.column} | line: ${this.line})`;
    }
}
