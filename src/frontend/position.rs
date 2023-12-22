#[derive(Debug, Clone)]
/// A coordinate implementation for simplified column and line.
pub struct Position {
    /// The column position
    pub column: i32,
    /// The initial column position
    pub initial_column: i32,
    /// The line position
    pub line: i32,
}

impl Position {
    pub fn new(column: i32, line: i32) -> Self {
        Position { column, initial_column: column, line }
    }

    pub fn next_column(&mut self) {
        self.column += 1;
    }

    pub fn next_line(&mut self) {
        self.line += 1;
        self.column = self.initial_column;
    }
}
