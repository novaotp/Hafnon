import { Symbol } from "./symbol";

export class Scope {
    /** An optional parent scope. */
    private parent: Scope | undefined;
    /** The symbols that exist inside the current scope. */
    private symbols: Map<string, Symbol> = new Map();

    /**
     * Creates a new scope.
     * @param parent An optional parent scope
     * @returns An instance of {@link Scope}
     */
    constructor(parent?: Scope) {
        this.parent = parent;
    }

    /**
     * Adds a symbol to the current scope.
     * @param symbol The symbol to add
     */
    public add(symbol: Symbol): void {
        this.symbols.set(symbol.identifier, symbol);
    }

    /**
     * Searches for a symbol that matches the given symbol's identifier in the current scope.
     * @param symbol The symbol to search
     * @returns `true` if the symbol's identifier exists, `false` otherwise
     */
    public has(symbol: Symbol): boolean {
        return this.symbols.has(symbol.identifier);
    }

    /**
     * Searches for a symbol that matches the given symbol's identifier in the current and parent scopes.
     * @param symbol The symbol to search
     * @returns `true` if the symbol's identifier exists, `false` otherwise
     */
    public hasAny(symbol: Symbol): boolean {
        let currentScope: Scope | undefined = this;

        while (currentScope) {
            if (currentScope.symbols.has(symbol.identifier)) {
                return true;
            } else {
                currentScope = currentScope.parent;
            }
        }

        return false;
    }
}
