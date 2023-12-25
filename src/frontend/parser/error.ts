import chalk from "chalk";
import { Token } from "../token.js";

interface ParserError {
    /** The error message to display. */
    message: string;
    /** The token on which the error occurred. Used to underline the error using its position. */
    token: Token;
    /** A hint to help the developer. */
    hint: string;
}

export class ParserErrorLogger {
    /** The error stack holding every error. */
    private stack: ParserError[];
    /** The raw source code to take a snippet from. */
    private sourceCode: string;

    constructor(sourceCode: string) {
        this.stack = [];
        this.sourceCode = sourceCode;
    }

    /**
     * Adds a new error to the stack.
     * @param error The error to add
     */
    public add(error: ParserError): void {
        this.stack.push(error);
    }

    /**
     * Displays a single error.
     * @param error The error to display
     */
    private displayError(error: ParserError): void {
        const { message, token, hint } = error;

        /** This is set to the length of the `Where` word + : + the space. */
        const initalRepeat = 7;

        const log = `
${chalk.red("Parser Error")} at line ${token.position.line}, column ${token.position.column}

${chalk.red("Why")}: ${message}
${chalk.blueBright("Where")}: ${this.sourceCode.split("\r\n").at(token.position.line - 1)}
${" ".repeat(initalRepeat + token.position.column - 1)}${chalk.red("^".repeat(token.length))}

${chalk.green("Hint")}: ${hint}
        `;

        console.log(log);
    }

    /** Displays all the errors. */
    public display(): void {
        this.stack.forEach(error => this.displayError(error));
    }
}