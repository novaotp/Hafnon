#[derive(Debug, Clone, PartialEq)]
/// An enum object for every token type
pub enum TokenType {
    Type,
    VarModifiers,
    Keyword,

    // Conditionals
    If,
    ElseIf,
    Else,

    // Loops
    While,
    For,
    ForEach,
    In,

    Integer,
    Float,
    String,
    Boolean,

    Unknown,
    Identifier,
    Assign,

    // Delimiter
    Colon,
    SemiColon,
    Dot,
    Comma,

    // Binary Operators
    Addition,
    Subtraction,
    Multiplication,
    Division,
    IntegerDivision,
    Modulo,
    Power,

    // Comparison Operators
    Equal,
    NotEqual,
    GreaterThan,
    GreaterOrEqual,
    LessThan,
    LessOrEqual,

    // Logical Operators
    And,
    Or,
    Not,

    // Brackets
    LeftParen, // (
    RightParen, // )
    LeftBracket, // [
    RightBracket, // ]
    LeftBrace, // {
    RightBrace, // }

    // End of file
    EOF,
}