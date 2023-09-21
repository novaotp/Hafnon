use crate::frontend::position::Position;
use crate::frontend::token_type::TokenType;

#[derive(Debug)]
/// A token implementation for individual tokens.
pub struct Token {
    /// The type
    pub token_type: TokenType,
    /// The value
    pub value: String,
    /// The start position in the source code
    pub start_position: Position,
    /// The end position in the source code
    pub end_position: Position,
}

impl Token {
    /// Function to instantiate a new instance of Token.
    ///
    /// # Arguments
    ///
    /// * `token_type` - The type
    /// * `value` - The value
    /// * `column` - The column in the source code
    /// * `line` - The line in the source code
    pub fn new(token_type: TokenType, value: &str, start_position: Position, end_position: Position) -> Self {
        Token {
            token_type,
            value: value.to_string(),
            start_position,
            end_position,
        }
    }
}