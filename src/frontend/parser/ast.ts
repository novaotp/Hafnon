import { Type } from "../constants";

type NodeType = "Program" | "VariableDeclaration";

export interface ASTNode {
    /** The kind of AST node. */
    kind: NodeType;
}

export interface ProgramNode extends ASTNode {
    kind: "Program";
    /** The full program body. */
    body: ASTNode[];
}

export interface VariableDeclarationNode extends ASTNode {
    kind: "VariableDeclaration";
    /** If the variable is mutable or not. */
    isMutable: boolean;
    /** The static type of the variable. */
    type: Type;
    /** The variable's identifier. */
    identifier: string;
    /** The value of the variable. */
    value: string;
}
