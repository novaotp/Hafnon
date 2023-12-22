use std::collections::HashMap;
use crate::frontend::semer::symbol::Symbol;

#[derive(Debug, Clone)]
pub struct Scope {
    symbols: HashMap<String, Symbol>,
    parent: Option<Box<Scope>>, // Use Option to make the main scope (the global scope) parentless.
}

impl Scope {
    pub fn new(parent: Option<Box<Scope>>) -> Self {
        Scope { symbols: HashMap::new(), parent }
    }

    pub fn symbols(self) -> HashMap<String, Symbol> {
        return self.symbols;
    }

    pub fn parent(self) -> Option<Box<Scope>> {
        return self.parent;
    }
}
