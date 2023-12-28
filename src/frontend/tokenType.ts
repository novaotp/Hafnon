export enum TokenType {
    // Primitives Types
    Integer,
    Float,
    String,
    Boolean,
    Vector,
    Type,

    Identifier,

    // Binary Operators
    BinaryOperator,

    // Comparison Operators
    Assignment,
    Equal,
    NotEqual,
    GreaterThan,
    GreaterOrEqual,
    LessThan,
    LessOrEqual,

    // Punctiation
    SemiColon,
    Comma,
    Colon,
    Dot,

    // Brackets
    OpenParen,
    CloseParen,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,

    // Conditionals
    If,
    Elif,
    Else,
    While,
    For,
    ForEach,

    // Keywords
    Mutable,
    Function,

    // End Of File
    EOF,
}

export const tokenToString = (token: TokenType): string => {
    switch (token) {
        case TokenType.Integer: return "Integer";
        case TokenType.Float: return "Float";
        case TokenType.String: return "String";
        case TokenType.Boolean: return "Boolean";
        case TokenType.Vector: return "Vector";
        case TokenType.Identifier: return "Identifier";
        case TokenType.BinaryOperator: return "BinaryOperator";
        case TokenType.Assignment: return "Assignment";
        case TokenType.Equal: return "Equal";
        case TokenType.NotEqual: return "NotEqual";
        case TokenType.GreaterThan: return "GreaterThan";
        case TokenType.GreaterOrEqual: return "GreaterOrEqual";
        case TokenType.LessThan: return "LessThan";
        case TokenType.LessOrEqual: return "LessOrEqual";
        case TokenType.SemiColon: return "SemiColon";
        case TokenType.Comma: return "Comma";
        case TokenType.Colon: return "Colon";
        case TokenType.Dot: return "Dot";
        case TokenType.OpenParen: return "OpenParen";
        case TokenType.CloseParen: return "CloseParen";
        case TokenType.OpenBrace: return "OpenBrace";
        case TokenType.CloseBrace: return "CloseBrace";
        case TokenType.OpenBracket: return "OpenBracket";
        case TokenType.CloseBracket: return "CloseBracket";
        case TokenType.If: return "If";
        case TokenType.Elif: return "Elif";
        case TokenType.Else: return "Else";
        case TokenType.While: return "While";
        case TokenType.For: return "For";
        case TokenType.ForEach: return "ForEach";
        case TokenType.Mutable: return "Mutable";
        case TokenType.Function: return "Function";
        case TokenType.Type: return "Type";
        case TokenType.EOF: return "EOF";
        default: return "Unimplemented";
    }
}
