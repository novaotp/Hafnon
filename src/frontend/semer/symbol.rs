/// Represents a single symbol in the symbol table.
#[derive(Debug, Clone)]
pub struct Symbol {
    /// The name of the symbol.
    pub name: String,
    /// The type of the symbol, e.g., "variable", "function", etc.
    pub symbol_type: SymbolType,
    /// The data type of the symbol, e.g., "int", "string", "vector", etc.
    pub data_type: Option<String>,
}

/// Enum representing the different types of symbols.
#[derive(Debug, Clone)]
pub enum SymbolType {
    Variable,
    Function,
    // Add other symbol types as needed.
}
