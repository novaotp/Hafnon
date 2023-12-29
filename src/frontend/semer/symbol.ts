export interface Symbol {
    /** The name of the symbol. */
    identifier: string;
}

export class Symbol {
    public identifier: string;

    /**
     * Creates a new {@link Symbol}.
     * @param identifier The name of the symbol
     */
    constructor(identifier: string) {
        this.identifier = identifier;
    }
}
