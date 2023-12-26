import { writeToFile } from "../../helper.js";
import { Token } from "../token.js";
import { TokenType } from "../tokenType.js";
import { ASTNode, BinaryExpression, BooleanLiteral, Expression, NumericLiteral, ProgramNode, StringLiteral, VariableDeclarationNode } from "./ast.js";
import { ParserErrorLogger } from "./error.js";

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
        return this.tokens.at(this.cursor);
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
            default:
                this.parseExpression();
        }
    }

    /**
     * Parses a variable declaration statement.
     * @example
     * mutable int x = 42;
     */
    private parseVariableDeclaration(): VariableDeclarationNode {
        const isMutable: boolean =
            this.currentToken().type === TokenType.Mutable
                ? true
                : false;

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
        this.advance();

        return {
            kind: "VariableDeclaration",
            isMutable: isMutable,
            type: type,
            identifier: identifier,
            value: value
        } as VariableDeclarationNode;
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
                    value: token.value,
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
                console.error(
                    "Unexpected token found during parsing !",
                    this.currentToken(),
                );
                break;

        }
    }
}
