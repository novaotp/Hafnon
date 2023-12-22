/*use crate::frontend::semer::scope::Scope;
use crate::frontend::semer::symbol::Symbol;

pub struct SymbolTable {
    current_scope: Scope,
}

impl SymbolTable {
    fn new() -> Self {
        SymbolTable { current_scope: Scope::new(None) }
    }

    fn enter_scope(&mut self) {
        let new_scope = Scope::new(Some(Box::new(self.current_scope.clone())));
        self.current_scope = new_scope;
    }

    fn exit_scope(&mut self) {
        if let Some(parent) = self.current_scope.clone().parent() {
            self.current_scope = *parent;
        } else {
            panic!("Can't exit the global scope!"); // Or handle this more gracefully, based on your language's semantics.
        }
    }

    fn insert(&mut self, name: String, symbol: Symbol) {
        self.current_scope.symbols().insert(name, symbol);
    }

    fn retrieve(&mut self, name: &String) -> Option<&Symbol> {
        let mut scope: Scope = self.current_scope.clone();

        loop {
            if let Some(parent) = scope.parent() {
                scope = *parent;
            } else {
                break;
            }

            if let Some(symbol) = scope.symbols().get(name) {
                return Some(symbol);
            }
        }

        return None;
    }
}
*/