import { Position } from "../position";
import { Token } from "../token";
import { TokenType } from "../tokenType";
import {
    BINARY_OPERATORS,
    BOOLEANS,
    BRACKETS,
    BinaryOperator,
    COMPARISON_OPERATORS,
    KEYWORDS,
    PUNCTUATIONS,
    TYPES,
    Type,
    Boolean
} from "../constants";

export class Lexer {
    /** The raw source code. */
    private readonly sourceCode: string;
    /** The individual characters of the raw source code. */
    private readonly chars: string[];
    /** The current cursor index. */
    private cursor: number;
    /** The current position in the raw source code. */
    private currentPosition: Position;
    /** The generated array of tokens. */
    private tokens: Token[];

    /**
     * Processes a given source code and output an array of tokens.
     * @param sourceCode The raw source code to process
     * @returns An instance of {@link Lexer}
     */
    constructor(sourceCode: string) {
        this.sourceCode = sourceCode;
        this.chars = this.sourceCode.split("");
        this.cursor = 0;
        this.currentPosition = { column: 1, line: 1 };
        this.tokens = [];
    }

    private nextColumn(): void {
        this.currentPosition.column++;
    }

    private nextLine(): void {
        this.currentPosition.line++;
        this.currentPosition.column = 1;
    }

    private clonePosition(): Position {
        return structuredClone(this.currentPosition);
    }

    /** Returns the current char. */
    private currentChar(): string {
        return this.chars.at(this.cursor)!;
    }

    /** Returns the current character and advances the index. */
    private advance(): string {
        const char = this.currentChar();
        this.cursor += 1;

        return char;
    }

    private createToken(value: string, type: TokenType, length: number, position: { column: number, line: number }): Token {
        return { value, type, length, position };
    }

    private isBinaryOperator(): boolean {
        return BINARY_OPERATORS.includes(this.currentChar() as BinaryOperator);
    }

    private isAlpha(): boolean {
        return /[a-zA-Z]/.test(this.currentChar());
    }

    private isNumeric(): boolean {
        return /^\d$/.test(this.currentChar());
    }

    private isSkippable(): boolean {
        return [" ", "\r", "\n", "\t"].includes(this.currentChar());
    }

    private isPunctuation(): boolean {
        return PUNCTUATIONS.has(this.currentChar());
    }

    private isBracket(): boolean {
        return BRACKETS.has(this.currentChar());
    }

    private isComparisonOperator(): boolean {
        return ["=", "==", "!=", ">", ">=", "<", ">="].includes(this.currentChar());
    }

    private isString(): boolean {
        return this.currentChar() === '"';
    }

    /**
     * Lexes the given source code and returns an array of tokens.
     * @returns An array of tokens generated from the given source code.
     */
    public tokenize(): Token[] {
        while (this.cursor < this.chars.length) {
            switch (true) {
                case this.isBracket(): {
                    const bracket = this.advance();
                    const position = this.clonePosition();
                    this.nextColumn();
                    const token = this.createToken(bracket, BRACKETS.get(bracket)!, 1, position);
                    this.tokens.push(token);
                    break;
                }

                case this.isBinaryOperator(): {
                    const operator = this.advance();
                    const position = this.clonePosition();
                    this.nextColumn();
                    const token = this.createToken(operator, TokenType.BinaryOperator, 1, position);
                    this.tokens.push(token);
                    break;
                }

                case this.isPunctuation(): {
                    const operator = this.advance();
                    const position = this.clonePosition();
                    this.nextColumn();
                    const token = this.createToken(operator, PUNCTUATIONS.get(operator)!, 1, position);
                    this.tokens.push(token);
                    break;
                }

                case this.isNumeric(): {
                    let nums = "";
                    let hasDot = false;
                    const position = this.clonePosition();

                    while (this.cursor < this.chars.length) {
                        if (!this.isNumeric() && (this.currentChar() !== '.' || hasDot)) {
                            break;
                        } else if (this.currentChar() === '.' && !hasDot) {
                            hasDot = true;
                        }

                        nums += this.advance();
                        this.nextColumn();
                    }

                    const tokenType = hasDot ? TokenType.Float : TokenType.Integer;
                    const token = this.createToken(nums, tokenType, nums.length, position);
                    this.tokens.push(token);
                    break;
                }

                case this.isComparisonOperator(): {
                    let operator = this.advance();
                    const position = this.clonePosition();
                    this.nextColumn();

                    if (COMPARISON_OPERATORS.has(`${operator}${this.currentChar()}`)) {
                        operator += this.advance();
                        this.nextColumn();
                    }

                    const token = this.createToken(operator, COMPARISON_OPERATORS.get(operator)!, operator.length, position);
                    this.tokens.push(token);
                    break;
                }

                case this.isAlpha(): {
                    let alpha = "";
                    const position = this.clonePosition();

                    while ((this.cursor < this.chars.length) && /[a-zA-Z0-9_]/.test(this.currentChar())) {
                        alpha += this.advance();
                        this.nextColumn();
                    }

                    const tokenType =
                        KEYWORDS.has(alpha)
                            ? KEYWORDS.get(alpha)
                            : TYPES.includes(alpha as Type)
                                ? TokenType.Type
                                    : BOOLEANS.includes(alpha as Boolean)
                                        ? TokenType.Boolean
                                        : TokenType.Identifier;

                    const token = this.createToken(alpha, tokenType!, alpha.length, position);
                    this.tokens.push(token);
                    break;
                }

                case this.isString():
                    const position = this.clonePosition();

                    // Skip the first "
                    this.advance();
                    this.nextColumn();

                    let string = "";

                    while ((this.cursor < this.chars.length) && this.currentChar() !== '"') {
                        string += this.advance();
                        this.nextColumn();
                    }

                    // Skip the last "
                    this.advance();
                    this.nextColumn();

                    const token = this.createToken(string, TokenType.String, string.length, position);
                    this.tokens.push(token);
                    break;

                case this.isSkippable(): {
                    switch (this.currentChar()) {
                        case " ":
                            this.advance();
                            this.nextColumn();
                            break;

                        // New line for Windows
                        // 2 advances because Windows newline is \r\n
                        case "\r":
                            this.advance();
                            this.advance();
                            this.nextLine();
                            break;

                        // New line for Unix-systems
                        case "\n":
                            this.advance();
                            this.nextLine();
                            break;

                        case "\t":
                            for (let i = 0; i < 4; i++) {
                                this.advance();
                                this.nextColumn();
                            }
                            break;

                        default:
                            throw new Error(`Unknown skippable character ${this.currentChar()}`);

                    }
                    break;
                }

                default:
                    throw new Error(`Unexpected char : <${this.currentChar()}>`);
            }
        }

        const eof = this.createToken("", TokenType.EOF, 0, this.clonePosition());
        this.tokens.push(eof);
        return this.tokens;
    }
}

