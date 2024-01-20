import { BinaryOperator } from "./constants";
import { Position } from "./position";

type NodeType =
    "Program" |
    "VariableDeclaration" |
    "VariableAssignment" |
    "FunctionDeclaration" |
    "FunctionArgument" |
    "FunctionCall" |
    "ConditionalExpression" |
    "BinaryExpression" |
    "NumericLiteral" |
    "StringLiteral" |
    "BooleanLiteral" | 
    "VectorExpression" |
    "Identifier";

interface ASTNode {
    /** The kind of AST node. */
    kind: NodeType;
    /** The position of the AST node in the source code. */
    position: { start: Position, end: Position }
}

export const defaultConditionalGroup = (): AST.Expression.ConditionalGroup => {
    return {
        condition: { kind: "BooleanLiteral", value: true } as AST.Expression.Literal.Boolean,
        body: []
    } as AST.Expression.ConditionalGroup;
}

/** The root namespace for the AST nodes. */
export namespace AST {
    export interface VectorType {
        type: "vector",
        subType: Type
    }
    export type Type = "any" | "string" | "int" | "float" | "bool" | VectorType;

    export interface Program extends ASTNode {
        kind: "Program";
        /** The full program body. */
        body: Statement[];
    }

    export interface Statement extends ASTNode { }

    export namespace Statement {
        export interface VariableDeclaration extends Statement {
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

        export interface VariableAssignment extends Statement {
            kind: "VariableAssignment";
            /** The name of the variable. */
            identifier: string;
            /** The new value of the variable. */
            newValue: Expression | undefined;
        }
    }

    export interface Expression extends Statement { }

    export namespace Expression {
        export interface FunctionDeclaration extends Expression {
            kind: "FunctionDeclaration";
            /** The return type of the function. */
            returnType: Type;
            /** The name of the function. */
            identifier: string;
            /** The function's parameters. */
            parameters: Statement[];
            /** The function's body. */
            body: Statement[];
        }

        export interface FunctionCall extends Expression {
            kind: "FunctionCall";
            /** The name of the function to call. */
            identifier: string;
            /** The function's arguments. */
            arguments: Expression[];
        }

        export interface ConditionalGroup {
            condition: Expression;
            body: Statement[];
        }

        export interface Conditional extends Expression {
            kind: "ConditionalExpression";
            if: ConditionalGroup;
            elif: ConditionalGroup[] | undefined;
            else: ConditionalGroup | undefined;
        }

        export interface Binary extends Expression {
            kind: "BinaryExpression";
            /** The left operand of the expression. */
            left: Expression;
            /** The operator of the expression. */
            operator: BinaryOperator;
            /** The right operand of the expression. */
            right: Expression;
        }

        export interface Identifier extends Expression {
            kind: "Identifier",
            /** The symbol of the variable. */
            symbol: string;
        }

        export interface Vector extends Expression {
            kind: "VectorExpression";
            /** The values of the vector. */
            values: Expression[];
        }

        export interface Literal extends Expression {
            /** The value of the literal. */
            value: string | number | boolean;
        }

        export namespace Literal {
            export interface String extends Literal {
                kind: "StringLiteral";
                value: string;
            }

            export interface Numeric extends Literal {
                kind: "NumericLiteral";
                value: number;
            }

            export interface Boolean extends Literal {
                kind: "BooleanLiteral";
                value: boolean;
            }
        }
    }
}
