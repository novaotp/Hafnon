import { Token } from "../token";
import { TokenType, tokenToString } from "../tokenType";
import { ParserErrorLogger } from "./error";
import { AST, defaultConditionalGroup } from "./ast";

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
            const node = this.parse();
            programBody.push(node);
        }

        this.errorLogger.display();

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

        // Skip the } token
        this.advance();

        return {
            kind: "FunctionDeclaration",
            returnType,
            identifier,
            arguments: args,
            body
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
        const identifier = this.advance().value;

        /**
         * For now, skip the function params.
         */
        // Skip the ( token
        this.advance();
        // Skip the ) token
        this.advance();
        const parameters: AST.Expression[] = [];

        // Skip the ; token
        this.advance();

        return {
            kind: "FunctionCall",
            identifier,
            parameters
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

        return {
            kind: "ConditionalExpression",
            if: ifGroup,
            elif: elifGroup,
            else: elseGroup
        } as AST.Expression.Conditional;
    }

    /** Parses a vector. */
    private parseVectorExpression(): AST.Expression {
        if (this.currentToken().type !== TokenType.OpenBracket) {
            return this.parseComparativeExpression();
        }

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

        // Skip ] token
        this.expect(TokenType.CloseBracket);

        return {
            kind: "VectorExpression",
            values
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

        switch (token.type) {
            case TokenType.Integer:
                return {
                    kind: "NumericLiteral",
                    value: parseInt(token.value),
                } as AST.Expression.Literal.Numeric;

            case TokenType.Float:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(token.value),
                } as AST.Expression.Literal.Numeric;

            case TokenType.String:
                return {
                    kind: "StringLiteral",
                    value: new String(token.value).valueOf(),
                } as AST.Expression.Literal.String;

            case TokenType.Identifier:
                return {
                    kind: "Identifier",
                    symbol: new String(token.value).valueOf()
                } as AST.Expression.Identifier;

            case TokenType.Boolean:
                return {
                    kind: "BooleanLiteral",
                    value: new Boolean(token.value).valueOf(),
                } as AST.Expression.Literal.Boolean;

            case TokenType.OpenParen:
                this.expect(TokenType.OpenParen);

                const value = this.parseExpression();

                this.expect(TokenType.CloseParen);

                return value;

            default:
                throw new Error("Unexpected token: " + JSON.stringify(token));

        }
    }
}
