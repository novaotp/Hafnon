import { Position } from "./lexer/Position";
import { TokenType } from "./tokenType";

export interface Token {
    /** The value of the token. */
    value: string;
    /** The length of the token. */
    length: number;
    /** The type of the token. */
    type: TokenType;
    /** The position of the token in the source code. */
    position: Position;
}
