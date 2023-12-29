import { AST } from "../ast";
import { SemanticLogger } from "./logger";
import { Scope } from "./scope";
import { Symbol } from "./symbol";

export class Semer {
    /** The AST to analyze. */
    private ast: AST.Statement[];
    /** The error logger. */
    private logger: SemanticLogger;
    /** The global scope. */
    private globalScope: Scope = new Scope();

    /**
     * Analyzes a given AST and logs all the encountered errors.
     * @param ast The AST to analyze
     * @param sourceCode The raw source code used for logging errors
     * @returns An instance of {@link Semer | Semantic Analyzer}
     */
    constructor(ast: AST.Statement[], sourceCode: string) {
        this.ast = ast;
        this.logger = new SemanticLogger(sourceCode)
    }

    /** The main function to analyze the AST. */
    public analyze(): AST.Statement[] {
        for (const statement of this.ast) {
            switch (statement.kind) {
                case "VariableDeclaration": {
                    const variableDeclaration = statement as AST.Statement.VariableDeclaration;
                    const symbol = new Symbol(variableDeclaration.identifier)

                    if (this.globalScope.has(symbol)) {
                        this.logger.add({
                            message: "Cannot re-declare a variable with the same name within the same scope.",
                            type: "error",
                            hint: "1. Rename the variable | 2. Create an inner scope",
                            node: statement
                        })
                    }
                    
                    this.globalScope.add(symbol);
                    break;
                }
                case "VariableAssignment": {
                    const variableAssignment = statement as AST.Statement.VariableAssignment;
                    const symbol = new Symbol(variableAssignment.identifier);

                    if (!this.globalScope.has(symbol)) {
                        this.logger.add({
                            message: "Cannot assign a value to a variable that hasn't been declared.",
                            type: "error",
                            hint: "Declare the variable before use with the `mutable` keyword",
                            node: statement
                        })
                    }

                    break;
                }
            }
        }

        this.logger.display();

        return this.ast;
    }
}
