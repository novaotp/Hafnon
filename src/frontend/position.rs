#[derive(Debug)]
/// A coordinate implementation for simplified column and line.
pub struct Position {
    /// The column position
    pub column: i32,
    /// The line position
    pub line: i32,
}