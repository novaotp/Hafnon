import chalk from "chalk";
import { AST } from "../ast";

export interface SemanticLog {
    /** The error message to display. */
    message: string;
    /** The type of the log. Used for colors in the stdout. */
    type: "warning" | "error";
    /** A hint to help the developer. */
    hint: string;
    /** The node on which the error occurred. */
    node: AST.Statement;
}

export class SemanticLogger {
    private logs: SemanticLog[];
    /** The raw source code to take a snippet from. */
    private sourceCode: string;

    /**
     * Stores and displays semantic-related logs.
     * @param sourceCode The raw source code to take a snippet from.
     * @returns An instance of {@link SemanticLogger}
     */
    constructor(sourceCode: string) {
        this.logs = [];
        this.sourceCode = sourceCode;
    }

    /** Returns the number of registered logs. */
    public count(): number {
        return this.logs.length;
    }

    /**
     * Adds a new error to the stack.
     * @param error The error to add
     */
    public add(error: SemanticLog): void {
        this.logs.push(error);
    }

    /**
     * Displays a single error.
     * @param error The error to display
     */
    private displayLog({ message, type, hint, node }: SemanticLog): void {
        /** This is set to the length of the `Where` word + : + the space. */
        const initalRepeat = 7;

        const log = `
${type === "error" ? chalk.red("Compiler Error") : chalk.rgb(255, 165, 0)("Compiler Warning")} at line ${node.position.start.line}, column ${node.position.start.column}

    ${chalk.red("Why")}: ${message}
    ${chalk.blueBright("Where")}: ${this.sourceCode.split("\r\n").at(node.position.start.line - 1)}
    ${" ".repeat(initalRepeat + node.position.start.column - 1)}${chalk.red("^".repeat(node.position.end.column - node.position.start.column))}

    ${chalk.green("Hint")}: ${hint}
        `;

        console.log(log);
    }

    /** Displays all the errors. */
    public display(): void {
        this.logs.forEach(log => this.displayLog(log));
    }
}