import { BinaryOperator, Type } from "../constants";

type NodeType =
    "Program" |
    "VariableDeclaration" |
    "VariableAssignment" |
    "FunctionDeclaration" |
    "FunctionCall" |
    "BinaryExpression" |
    "NumericLiteral" |
    "StringLiteral" |
    "BooleanLiteral";

export interface ASTNode {
    /** The kind of AST node. */
    kind: NodeType;
}

export interface ProgramNode extends ASTNode {
    kind: "Program";
    /** The full program body. */
    body: ASTNode[];
}

export interface Statement extends ASTNode { }

export interface VariableDeclarationStatement extends Statement {
    kind: "VariableDeclaration";
    /** If the variable is mutable or not. */
    isMutable: boolean;
    /** The static type of the variable. */
    type: Type;
    /** The name of the variable. */
    identifier: string;
    /** The value of the variable. */
    value: Expression | undefined;
}

export interface VariableAssignmentStatement extends Statement {
    kind: "VariableAssignment";
    /** The name of the variable. */
    identifier: string;
    /** The new value of the variable. */
    newValue: Expression | undefined;
}

export interface Expression extends Statement { }
    
export interface FunctionDeclarationExpression extends Expression {
    kind: "FunctionDeclaration";
    /** The return type of the function. */
    returnType: Type;
    /** The name of the function. */
    identifier: string;
    /** The function's arguments. */
    arguments: Statement[];
    /** The function's body. */
    body: Statement[];
}

export interface FunctionCallExpression extends Expression {
    kind: "FunctionCall";
    /** The name of the function to call. */
    identifier: string;
    /** The function's parameters. */
    parameters: Expression[];
}

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
