import { TokenType } from "./tokenType";

export const KEYWORDS = new Map<string, TokenType>([
    ["mutable", TokenType.Mutable],
    ["fn", TokenType.Function]
]);

export const BOOLEANS = ["true", "false"] as const;
export type Boolean = typeof BOOLEANS[number];

export const TYPES = ["string", "int", "float", "bool", "vector"] as const;
export type Type = typeof TYPES[number];

export const BRACKETS = new Map<string, TokenType>([
    ["(", TokenType.OpenParen],
    [")", TokenType.CloseParen],
    ["[", TokenType.OpenBracket],
    ["]", TokenType.CloseBracket],
    ["{", TokenType.OpenBrace],
    ["}", TokenType.CloseBrace]
]);

export const BINARY_OPERATORS = ["+", "-", "*", "/", "^", "#", "%"] as const;
export type BinaryOperator = typeof BINARY_OPERATORS[number];

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
