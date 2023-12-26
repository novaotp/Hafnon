import { BinaryOperator, Type } from "../constants.js";

type NodeType = "Program" | "VariableDeclaration" | "BinaryExpression" | "NumericLiteral" | "StringLiteral" | "BooleanLiteral";

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
    value: Expression | undefined;
}

export interface Expression extends ASTNode { }

export interface BinaryExpression extends Expression {
    kind: "BinaryExpression";
    /** The left operand of the expression. */
    left: Expression;
    /** The operator of the expression. */
    operator: BinaryOperator;
    /** The right operand of the expression. */
    right: Expression;
}

export interface Literal extends Expression {
    /** The value of the literal. */
    value: string | number | boolean;
}

export interface StringLiteral extends Literal {
    kind: "StringLiteral";
    value: string;
}

export interface NumericLiteral extends Literal {
    kind: "NumericLiteral";
    value: number;
}

export interface BooleanLiteral extends Literal {
    kind: "BooleanLiteral";
    value: boolean;
}
