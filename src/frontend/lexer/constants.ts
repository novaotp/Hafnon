import { TokenType } from "./TokenType";

export const KEYWORDS = new Map<string, TokenType>([
    ["mutable", TokenType.Mutable],
    ["fn", TokenType.Function]
]);

export const BRACKETS = new Map<string, TokenType>([
    ["(", TokenType.OpenParen],
    [")", TokenType.CloseParen],
    ["[", TokenType.OpenBracket],
    ["]", TokenType.CloseBracket],
    ["{", TokenType.OpenBrace],
    ["}", TokenType.CloseBrace]
]);

export const BINARY_OPERATORS = new Map<string, TokenType>([
    ["+", TokenType.Addition],
    ["-", TokenType.Subtraction],
    ["*", TokenType.Multiplication],
    ["/", TokenType.Division],
    ["^", TokenType.Power],
    ["#", TokenType.IntegerDivision],
    ["%", TokenType.Modulo]
]);

export const COMPARISON_OPERATORS = new Map<string, TokenType>([
    ["=", TokenType.Assignment],
    ["==", TokenType.Equal],
    ["!=", TokenType.NotEqual],
    ["<", TokenType.LessThan],
    ["<=", TokenType.LessOrEqual],
    [">",TokenType.GreaterThan],
    [">=", TokenType.GreaterOrEqual]
]);

export const PUNCTUATIONS = new Map<string, TokenType>([
    [".", TokenType.Dot],
    [",", TokenType.Comma],
    [":", TokenType.Colon],
    [";", TokenType.SemiColon]
])
