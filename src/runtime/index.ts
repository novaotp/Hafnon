import { AST } from "@compilation/ast";

export class Runtime {
    /** The statements to execute. */
    private statements: AST.Statement[];

    /**
     * Executes the given statements.
     * @param ast The statements to execute
     */
    constructor(statements: AST.Statement[]) {
        this.statements = statements;
    }

    /** The entry point to execute the given statements. */
    public execute(): void {
        return;
    }
}
