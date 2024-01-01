import { Token } from "../token";
import { TokenType, tokenToString } from "../tokenType";
import { AST, defaultConditionalGroup } from "../ast";
import { Position } from "../position";

export class Parser {
    /** The array of tokens to parse. */
    private tokens: Token[];
    /** The current cursor index. */
    private cursor: number;

    /**
     * Pprocesses an array of tokens and outputs an AST.
     * @param tokens The array of tokens to parse.
     * @returns An instance of {@link Parser}
     */
    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.cursor = 0;
    }

    /** Returns a deep clone of the {@link currentToken | current token's} position. */
    private getPosition(): Position {
        if (this.lastToken().type === TokenType.EOF) {
            return structuredClone(this.lastToken().position);
        }

        return structuredClone(this.currentToken().position);
    }

    /** Returns the token at the {@link cursor | cursor's} position and moves the cursor by one. */
    private advance(): Token {
        const token = this.currentToken();
        this.cursor++;
        return token;
    }

    /** Returns the token at the {@link cursor | (cursor - 1)'s} position. */
    private lastToken(): Token {
        return this.tokens.at(this.cursor - 1)!;
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
     * Throws an error if the current token type isn't the expected type.
     * 
     * Otherwise, works the same as {@link advance | `this.advance`} method.
     */
    private expect(expectedToken: TokenType): Token {
        const token = this.advance();

        if (token.type !== expectedToken) {
            throw new Error(`Expected token : ${tokenToString(expectedToken)} | Got : ${tokenToString(token.type)}`);
        }

        return token;
    }

    /**
     * Produces the AST for the given tokens and prints every error that it has found.
     * @returns An ASTNode representing the main program
     */
    public produceAST(): AST.Program {
        const programBody: AST.Statement[] = [];

        while (this.cursor < this.tokens.length && this.currentToken().type !== TokenType.EOF) {
            const statement = this.parse();
            programBody.push(statement);
        }

        return {
            kind: "Program",
            body: programBody
        } as AST.Program;
    }

    /** The entry point for parsing a statement or an expression. */
    private parse(): AST.Statement {
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
     * // Both yield the same result
     * vector<string> days = new Vector<string>("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
     * vector<string> days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
     */
    private parseVariableDeclaration(): AST.Statement.VariableDeclaration {
        const start = this.getPosition();
        const isMutable: boolean = this.currentToken().type === TokenType.Mutable;

        if (isMutable) {
            this.advance();
        }

        const typeToken = this.expect(TokenType.Type);

        let type: AST.Type;

        if (typeToken.value === "vector") {
            let subType: AST.Type = "any";

            if (this.currentToken().type === TokenType.LessThan) {
                // Skip < token
                this.advance();

                subType = this.expect(TokenType.Type).value as AST.Type;

                // Skip > token
                this.expect(TokenType.GreaterThan);
            }

            type = {
                type: "vector",
                subType
            } as AST.VectorType;
        } else {
            type = typeToken.value as AST.Type;
        }

        const identifier = this.advance().value;

        let value: AST.Expression | undefined;
        if (this.currentToken().type === TokenType.SemiColon) {
            value = undefined;
        } else {
            // Skip = char
            this.advance();

            value = this.parseExpression();
        }

        const end = this.getPosition();

        // Skip ; char
        this.advance();

        return {
            kind: "VariableDeclaration",
            isMutable,
            type: type,
            identifier,
            value,
            position: { start, end }
        } as AST.Statement.VariableDeclaration;
    }

    /**
     * Parses a function declaration.
     * @example
     * fn void greet()
     * {
     *     println("Hello world!");
     * }
     */
    private parseFunctionDeclaration(): AST.Expression.FunctionDeclaration {
        const start = this.getPosition();
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
        const args: AST.Expression[] = [];

        // Skip the { token
        this.advance();

        const body: AST.Statement[] = [];
        while (this.currentToken().type !== TokenType.CloseBrace) {
            const statement = this.parse();
            body.push(statement);
        }

        const end = this.getPosition();

        // Skip the } token
        this.advance();

        return {
            kind: "FunctionDeclaration",
            returnType,
            identifier,
            arguments: args,
            body,
            position: { start, end }
        } as AST.Expression.FunctionDeclaration;
    }

    private parseVariableAssignmentOrFunctionCall(): AST.Statement.VariableAssignment | AST.Expression.FunctionCall {
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
    private parseVariableAssignment(): AST.Statement.VariableAssignment {
        const start = this.getPosition();
        const identifier = this.advance().value;

        // Skip the = token
        this.advance();

        const newValue = this.parseExpression();
        
        const end = this.getPosition();
        // Skip the ; token
        this.advance();

        return {
            kind: "VariableAssignment",
            identifier,
            newValue,
            position: { start, end }
        } as AST.Statement.VariableAssignment;
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
    private parseFunctionCall(): AST.Expression.FunctionCall {
        const start = this.getPosition();
        const identifier = this.advance().value;

        /**
         * For now, skip the function params.
         */
        // Skip the ( token
        this.advance();
        // Skip the ) token
        this.advance();
        const parameters: AST.Expression[] = [];

        const end = this.getPosition();
        // Skip the ; token
        this.advance();

        return {
            kind: "FunctionCall",
            identifier,
            parameters,
            position: { start, end }
        } as AST.Expression.FunctionCall;
    }

    /** The entry point to process expressions. */
    private parseExpression(): AST.Expression {
        return this.parseConditionalExpression();
    }

    /** Parses a if-elif-else branch. */
    private parseConditionalExpression(): AST.Expression {
        if (this.currentToken().type !== TokenType.If) {
            return this.parseVectorExpression();
        }

        let ifGroup: AST.Expression.ConditionalGroup = defaultConditionalGroup();
        const start = this.getPosition();

        this.expect(TokenType.If);
        this.expect(TokenType.OpenParen);

        ifGroup.condition = this.parseExpression();

        this.expect(TokenType.CloseParen);
        this.expect(TokenType.OpenBrace);

        while (this.currentToken().type !== TokenType.CloseBrace) {
            const statement = this.parse();
            ifGroup.body.push(statement);
        }

        this.expect(TokenType.CloseBrace);

        let elifGroup: AST.Expression.ConditionalGroup[] | undefined = undefined;
        while (this.currentToken().type === TokenType.Elif) {
            if (elifGroup === undefined) {
                elifGroup = [];
            }

            this.expect(TokenType.Elif);
            this.expect(TokenType.OpenParen);

            const elif: AST.Expression.ConditionalGroup = defaultConditionalGroup();

            elif.condition = this.parseExpression();

            this.expect(TokenType.CloseParen);
            this.expect(TokenType.OpenBrace);

            while (this.currentToken().type !== TokenType.CloseBrace) {
                const statement = this.parse();
                elif.body.push(statement);
            }

            this.expect(TokenType.CloseBrace);

            elifGroup?.push(elif);
        }

        let elseGroup: AST.Expression.ConditionalGroup | undefined = undefined;
        if (this.currentToken().type === TokenType.Else) {
            elseGroup = defaultConditionalGroup();

            this.expect(TokenType.Else);
            this.expect(TokenType.OpenBrace);

            while (this.currentToken().type !== TokenType.CloseBrace) {
                const statement = this.parse();
                elseGroup.body.push(statement);
            }

            this.expect(TokenType.CloseBrace);
        }

        // Need to use custom position because of the if-elif-else branches
        const end = structuredClone(this.tokens.at(this.cursor - 1)!.position);

        return {
            kind: "ConditionalExpression",
            if: ifGroup,
            elif: elifGroup,
            else: elseGroup,
            position: { start, end }
        } as AST.Expression.Conditional;
    }

    /** Parses a vector. */
    private parseVectorExpression(): AST.Expression {
        if (this.currentToken().type !== TokenType.OpenBracket) {
            return this.parseComparativeExpression();
        }
        const start = this.getPosition();

        // Skip [ token
        this.expect(TokenType.OpenBracket);

        const values: AST.Expression[] = [];
        while (this.currentToken().type !== TokenType.CloseBracket) {
            const expr = this.parseExpression();
            values.push(expr);

            // Skip comma
            if (this.currentToken().type === TokenType.Comma) {
                this.advance();
            }
        }
        
        const end = this.getPosition();
        // Skip ] token
        this.expect(TokenType.CloseBracket);

        return {
            kind: "VectorExpression",
            values,
            position: { start, end }
        } as AST.Expression.Vector;
    }

    private parseComparativeExpression(): AST.Expression {
        let left = this.parseAdditiveExpression();

        while (["==", "<", ">", "<=", ">=", "!="].includes(this.currentToken().value)) {
            const operator = this.advance().value;
            const right = this.parseAdditiveExpression();
            left = {
                kind: "BinaryExpression",
                left,
                right,
                operator,
            } as AST.Expression.Binary;
        }

        return left;
    }

    private parseAdditiveExpression(): AST.Expression {
        let left = this.parseMultiplicativeExpression();

        while (["+", "-"].includes(this.currentToken().value)) {
            const operator = this.advance().value;
            const right = this.parseMultiplicativeExpression();
            left = {
                kind: "BinaryExpression",
                left,
                right,
                operator,
            } as AST.Expression.Binary;
        }

        return left;
    }

    private parseMultiplicativeExpression(): AST.Expression {
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
            } as AST.Expression.Binary;
        }

        return left;
    }

    private parsePrimaryExpression(): AST.Expression {
        const token = this.advance();
        const start = structuredClone(token.position);
        const end = structuredClone(start);
        end.column += token.length;

        switch (token.type) {
            case TokenType.Integer:
                return {
                    kind: "NumericLiteral",
                    value: parseInt(token.value),
                    position: { start, end }
                } as AST.Expression.Literal.Numeric;

            case TokenType.Float:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(token.value),
                    position: { start, end }
                } as AST.Expression.Literal.Numeric;

            case TokenType.String:
                return {
                    kind: "StringLiteral",
                    value: new String(token.value).valueOf(),
                    position: { start, end }
                } as AST.Expression.Literal.String;

            case TokenType.Identifier:
                return {
                    kind: "Identifier",
                    symbol: new String(token.value).valueOf(),
                    position: { start, end }
                } as AST.Expression.Identifier;

            case TokenType.Boolean:
                return {
                    kind: "BooleanLiteral",
                    value: new Boolean(token.value).valueOf(),
                    position: { start, end }
                } as AST.Expression.Literal.Boolean;

            case TokenType.OpenParen:
                // ( token already skipped

                const value = this.parseExpression();

                this.expect(TokenType.CloseParen);

                return value;

            default:
                throw new Error("Unexpected token: " + JSON.stringify(token));

        }
    }
}
