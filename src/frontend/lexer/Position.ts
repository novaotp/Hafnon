export class Position {
    public column: number;
    public line: number;

    constructor(column: number, line: number) {
        this.column = column;
        this.line = line;
    }

    public nextColumn(): void {
        this.column += 1;
    }

    /** Also resets the column. */
    public nextLine(column: number = 1): void {
        this.line += 1;
        this.column = column;
    }

    public clone(): { column: number; line: number } {
        return { column: this.column, line: this.line };
    }
}
