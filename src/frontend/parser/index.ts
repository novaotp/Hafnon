import { Token } from "../token";
import { TokenType } from "../tokenType";
import { ASTNode, ProgramNode, VariableDeclarationNode } from "./ast";

export class Parser {
    /** The array of tokens to parse. */
    private tokens: Token[];
    /** The current cursor index. */
    private cursor: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.cursor = 0;
    }

    private currentToken(): Token {
        return this.tokens.at(this.cursor);
    }

    private parse(): ASTNode {
        switch (this.currentToken().type) {
            case TokenType.Mutable:
            case TokenType.String:
            case TokenType.Integer:
            case TokenType.Float:
            case TokenType.Boolean:
            case TokenType.Vector:
                return this.parseVariableDeclaration();
            default:
                throw new Error("Unimplemented parsing node value: " + this.currentToken().value);
        }
    }

    private parseVariableDeclaration(): VariableDeclarationNode {
        const isMutable =
            this.currentToken().type === TokenType.Mutable
                ? true
                : false;
            
        if (isMutable) {
            this.cursor++;
        }

        const type = this.currentToken().value;

        this.cursor++;

        const identifier = this.currentToken().value;

        this.cursor++;

        let value: string;
        if (!isMutable && this.currentToken().value === ";") {
            throw new Error("Cannot declare an immutable variable without a value");
        } else if (this.currentToken().value === ";") {
            value = "undefined";
        } else {
            // Skip = char
            this.cursor++;

            value = this.currentToken().value;
        }

        // Skip ; char
        this.cursor++;
        this.cursor++;

        return {
            kind: "VariableDeclaration",
            isMutable: isMutable,
            type: type,
            identifier: identifier,
            value: value
        } as VariableDeclarationNode;
    }

    /**
     * Produces the AST for the given tokens.
     * @returns An ASTNode representing the main program
     */
    public produceAST(): ProgramNode {
        const programBody: ASTNode[] = [];

        while (this.cursor < this.tokens.length && this.currentToken().type !== TokenType.EOF) {
            const node = this.parse();
            programBody.push(node);
        }

        return {
            kind: "Program",
            body: programBody
        } as ProgramNode;
    }
}
