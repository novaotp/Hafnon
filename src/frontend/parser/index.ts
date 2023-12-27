import { Token } from "../token";
import { TokenType } from "../tokenType";
import { ParserErrorLogger } from "./error";
import {
    ASTNode,
    BinaryExpression,
    BooleanLiteral,
    Expression,
    FunctionCallExpression,
    FunctionDeclarationExpression,
    NumericLiteral,
    ProgramNode,
    Statement,
    StringLiteral,
    VariableAssignmentStatement,
    VariableDeclarationStatement
} from "./ast";

export class Parser {
    /** The array of tokens to parse. */
    private tokens: Token[];
    /** The current cursor index. */
    private cursor: number;
    /** A custom error logger for the parser. */
    private errorLogger: ParserErrorLogger;

    constructor(tokens: Token[], sourceCode: string) {
        this.tokens = tokens;
        this.cursor = 0;
        this.errorLogger = new ParserErrorLogger(sourceCode);
    }

    /** Returns the token at the {@link cursor | cursor's} position and moves the cursor by one. */
    private advance(): Token {
        const token = this.currentToken();
        this.cursor++;
        return token;
    }

    /** Returns the token at the {@link cursor | cursor's} position. */
    private currentToken(): Token {
        return this.tokens.at(this.cursor)!;
    }

    /** Returns the token at the {@link cursor | (cursor + 1)'s} position. */
    private nextToken(): Token {
        return this.tokens.at(this.cursor + 1)!;
    }

    /**
     * Produces the AST for the given tokens and prints every error that it has found.
     * @returns An ASTNode representing the main program
     */
    public produceAST(): ProgramNode {
        const programBody: ASTNode[] = [];

        while (this.cursor < this.tokens.length && this.currentToken().type !== TokenType.EOF) {
            const node = this.parse();
            programBody.push(node);
        }

        this.errorLogger.display();

        return {
            kind: "Program",
            body: programBody
        } as ProgramNode;
    }

    /** The entry point for parsing a statement or an expression. */
    private parse(): ASTNode {
        switch (this.currentToken().type) {
            case TokenType.Mutable:
            case TokenType.Type:
                return this.parseVariableDeclaration();
            case TokenType.Function:
                return this.parseFunctionDeclaration();
            case TokenType.Identifier:
                return this.parseVariableAssignmentOrFunctionCall();
            default:
                return this.parseExpression();
        }
    }

    /**
     * Parses a variable declaration statement.
     * @example
     * mutable int x = 42;
     * @example
     * vector<string> days = new Vector<string>("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
     */
    private parseVariableDeclaration(): VariableDeclarationStatement {
        const isMutable: boolean = this.currentToken().type === TokenType.Mutable;

        if (isMutable) {
            this.advance();
        }

        const type = this.advance().value;
        const identifier = this.advance().value;

        let value: Expression | undefined;
        if (!isMutable && this.currentToken().value === ";") {
            this.errorLogger.add({
                message: "Cannot declare an immutable variable without a value.",
                token: this.currentToken(),
                hint: "Either add a value or declare the variable as mutable."
            });
        } else if (this.currentToken().value === ";") {
            value = undefined;
        } else {
            // Skip = char
            this.advance();

            value = this.parseExpression();
        }

        // Skip ; char
        const skipped = this.advance();

        return {
            kind: "VariableDeclaration",
            isMutable: isMutable,
            type: type,
            identifier: identifier,
            value: value
        } as VariableDeclarationStatement;
    }

    /**
     * Parses a function declaration.
     * @example
     * fn void greet()
     * {
     *     println("Hello world!");
     * }
     */
    private parseFunctionDeclaration(): FunctionDeclarationExpression {
        // Skip the fn token
        this.advance();

        const returnType = this.advance().value;
        const identifier = this.advance().value;

        /**
         * For now, skip the function args.
         */
        // Skip the ( token
        this.advance();
        // Skip the ) token
        this.advance();
        const args: Expression[] = [];

        // Skip the { token
        this.advance();

        const body: Statement[] = [];
        while (this.currentToken().type !== TokenType.CloseBrace) {
            const statement = this.parse();
            body.push(statement);
        }

        // Skip the } token
        this.advance();

        return {
            kind: "FunctionDeclaration",
            returnType,
            identifier,
            arguments: args,
            body
        } as FunctionDeclarationExpression;
    }

    private parseVariableAssignmentOrFunctionCall(): VariableAssignmentStatement | FunctionCallExpression {
        const nextToken = this.nextToken();

        if (nextToken.type === TokenType.Assignment) {
            return this.parseVariableAssignment();
        } else {
            return this.parseFunctionCall();
        }
    }

    /**
     * Parses a variable assignment.
     * @example
     * mutable int niceNumber = 69;
     * niceNumber = 420; // <- No error
     * @example
     * string helloWorld = "hello world";
     * helloWorld = "goodbye world"; // <- Error thrown because helloWorld isn't mutable
     */
    private parseVariableAssignment(): VariableAssignmentStatement {
        const identifier = this.advance().value;

        // Skip the = token
        this.advance();

        const newValue = this.parseExpression();

        // Skip the ; token
        this.advance();

        return {
            kind: "VariableAssignment",
            identifier,
            newValue
        } as VariableAssignmentStatement;
    }

    /**
     * Parses a function call.
     * @example
     * fn void greet()
     * {
     *     println("Hello world!");
     * }
     * greet();
     * @example
     * fn float complexCalculation(float a, float b)
     * {
     *     return a * b;
     * }
     * float result = complexCalculation(1, 2);
     * complexCalculation(complexCalculation(2, 6), result);
     */
    private parseFunctionCall(): FunctionCallExpression {
        const identifier = this.advance().value;

        /**
         * For now, skip the function params.
         */
        // Skip the ( token
        this.advance();
        // Skip the ) token
        this.advance();
        const parameters: Expression[] = [];

        // Skip the ; token
        this.advance();

        return {
            kind: "FunctionCall",
            identifier,
            parameters
        } as FunctionCallExpression
    }

    /** The entry point to process expressions. */
    private parseExpression(): Expression {
        return this.parseAdditiveExpression();
    }

    private parseAdditiveExpression(): Expression {
        let left = this.parseMultiplicativeExpression();

        while (["+", "-"].includes(this.currentToken().value)) {
            const operator = this.advance().value;
            const right = this.parseMultiplicativeExpression();
            left = {
                kind: "BinaryExpression",
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    private parseMultiplicativeExpression(): Expression {
        let left = this.parsePrimaryExpression();

        while (
            ["*", "/", "%", "#", "^"].includes(this.currentToken().value)
        ) {
            const operator = this.advance().value;
            const right = this.parsePrimaryExpression();
            left = {
                kind: "BinaryExpression",
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    private parsePrimaryExpression(): Expression {
        const token = this.advance();

        switch (token.type) {
            case TokenType.Integer:
                return {
                    kind: "NumericLiteral",
                    value: parseInt(token.value),
                } as NumericLiteral;

            case TokenType.Float:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(token.value),
                } as NumericLiteral;

            case TokenType.String:
                return {
                    kind: "StringLiteral",
                    value: new String(token.value).valueOf(),
                } as StringLiteral;

            case TokenType.Boolean:
                return {
                    kind: "BooleanLiteral",
                    value: new Boolean(token.value).valueOf(),
                } as BooleanLiteral;

            case TokenType.OpenParen:
                // Skip ( char
                this.advance();

                const value = this.parseExpression();

                // Skip ) char
                this.advance();

                return value;

            default:
                this.errorLogger.add({
                    message: "Unexpected token found during parsing",
                    token: this.currentToken(),
                    hint: "Ask the maintainers to support this token."
                });
                return { kind: "BinaryExpression" } as Expression;

        }
    }
}
