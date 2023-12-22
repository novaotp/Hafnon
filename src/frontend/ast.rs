#[derive(Debug)]
pub enum Node {
    // Primitive
    Integer { value: i64 },
    Float { value: f64 },
    String { value: String },
    Boolean { value: bool },

    // Binary operators
    Addition { left: Box<Node>, right: Box<Node> },
    Subtraction { left: Box<Node>, right: Box<Node> },
    Multiplication { left: Box<Node>, right: Box<Node> },
    Division { left: Box<Node>, right: Box<Node> },
    IntegerDivision { left: Box<Node>, right: Box<Node> },
    Modulo { left: Box<Node>, right: Box<Node> },
    Power { left: Box<Node>, right: Box<Node> },

    // Comparison operators
    Equal { left: Box<Node>, right: Box<Node> },
    NotEqual { left: Box<Node>, right: Box<Node> },
    GreaterThan { left: Box<Node>, right: Box<Node> },
    GreaterOrEqual { left: Box<Node>, right: Box<Node> },
    LessThan { left: Box<Node>, right: Box<Node> },
    LessOrEqual { left: Box<Node>, right: Box<Node> },

    Vector { items: Vec<Box<Node>>, },

    // Unary operators
    UnaryPlus { expr: Box<Node> },
    UnaryMinus { expr: Box<Node> },

    // Loops
    While { condition: Vec<Box<Node>>, block: Vec<Box<Node>> },
    ForEach { item_type: Box<String>, item_name: Box<String>, collection: Box<String>, block: Vec<Box<Node>> },

    // Variables
    Declaration { is_mutable: bool, var_type: String, identifier: String, initializer: Box<Node> },
    Assignment { identifier: String, value: Box<Node> },

    Program { expressions: Vec<Box<Node>> },
}

pub fn pretty_ast(node: &Node, indent: usize, last: bool) -> String {
    let mut result = String::new();
    let connector = if last { "└─" } else { "├─" };
    let indent_str = if indent > 0 {
        "│  ".repeat(indent - 1) + connector
    } else {
        "".to_string()
    };

    match node {
        Node::Program { expressions } => {
            result.push_str(&format!("{}Program\n", indent_str));
            let last_index = expressions.len() - 1;
            for (i, exp) in expressions.iter().enumerate() {
                result.push_str(&pretty_ast(exp, indent + 1, i == last_index));
            }
        },
        Node::While { condition, block } => {
            result.push_str(&format!("{}While\n", indent_str));

            // For condition
            if let Some((last_cond, elements)) = condition.split_last() {
                result.push_str(&"{}├─ Condition\n".replace("{}", &indent_str));
                for element in elements {
                    result.push_str(&pretty_ast(element, indent + 1, false));
                }
                result.push_str(&pretty_ast(last_cond, indent + 1, true));
            }

            // For block
            result.push_str(&"{}└─ Block\n".replace("{}", &indent_str));
            let last_index = block.len() - 1;
            for (i, stmt) in block.iter().enumerate() {
                result.push_str(&pretty_ast(stmt, indent + 1, i == last_index));
            }
        },
        Node::ForEach { item_type, item_name, collection, block } => {
            result.push_str(&format!("{}ForEach\n", indent_str));

            result.push_str(&format!("{}└─ Variable type: {}\n", indent_str, item_type));
            result.push_str(&format!("{}└─ Variable Name: {}\n", indent_str, item_name));
            result.push_str(&format!("{}└─ Collection: {}\n", indent_str, collection));

            // For block
            result.push_str(&"{}└─ Block\n".replace("{}", &indent_str));
            let last_index = block.len() - 1;
            for (i, stmt) in block.iter().enumerate() {
                result.push_str(&pretty_ast(stmt, indent + 1, i == last_index));
            }
        },
        Node::Vector { items } => {
            result.push_str(&format!("{}Vector\n", indent_str));
            let last_index = items.len() - 1;
            for (i, item) in items.iter().enumerate() {
                result.push_str(&pretty_ast(item, indent + 1, i == last_index));
            }
        },
        Node::Declaration { is_mutable, var_type, identifier, initializer } => {
            result.push_str(&format!("{}Declaration\n", indent_str));
            result.push_str(&format!("{}└─ Is Mutable: {}\n", indent_str, is_mutable));
            result.push_str(&format!("{}└─ Var Type: {}\n", indent_str, var_type));
            result.push_str(&format!("{}└─ Identifier: {}\n", indent_str, identifier));
            result.push_str(&pretty_ast(initializer, indent + 1, true));
        },
        Node::Integer { value } => {
            result.push_str(&format!("{}└─ Integer: {}\n", indent_str, value));
        },
        Node::Float { value } => {
            result.push_str(&format!("{}└─ Float: {}\n", indent_str, value));
        },
        Node::String { value } => {
            result.push_str(&format!("{}└─ String: {}\n", indent_str, value));
        },
        Node::Boolean { value } => {
            result.push_str(&format!("{}└─ Boolean: {}\n", indent_str, value));
        },
        Node::Addition { left, right }
        | Node::Subtraction { left, right }
        | Node::Multiplication { left, right }
        | Node::Division { left, right }
        | Node::IntegerDivision { left, right }
        | Node::Modulo { left, right }
        | Node::Power { left, right }
        | Node::Equal { left, right }
        | Node::NotEqual { left, right }
        | Node::GreaterThan { left, right }
        | Node::GreaterOrEqual { left, right }
        | Node::LessThan { left, right }
        | Node::LessOrEqual { left, right } => {
            let operation = match node {
                Node::Addition { .. } => "Addition",
                Node::Subtraction { .. } => "Subtraction",
                Node::Multiplication { .. } => "Multiplication",
                Node::Division { .. } => "Division",
                Node::IntegerDivision { .. } => "IntegerDivision",
                Node::Modulo { .. } => "Modulo",
                Node::Power { .. } => "Power",
                Node::Equal { .. } => "Equal",
                Node::NotEqual { .. } => "NotEqual",
                Node::GreaterThan { .. } => "GreaterThan",
                Node::GreaterOrEqual { .. } => "GreaterOrEqual",
                Node::LessThan { .. } => "LessThan",
                Node::LessOrEqual { .. } => "LessOrEqual",
                _ => "Unknown"
            };
            result.push_str(&format!("{}{}\n", indent_str, operation));
            result.push_str(&pretty_ast(left, indent + 1, false));
            result.push_str(&pretty_ast(right, indent + 1, true));
        },
        Node::UnaryPlus { expr } | Node::UnaryMinus { expr } => {
            let operation = match node {
                Node::UnaryPlus { .. } => "UnaryPlus",
                Node::UnaryMinus { .. } => "UnaryMinus",
                _ => "Unknown"
            };
            result.push_str(&format!("{}{}\n", indent_str, operation));
            result.push_str(&pretty_ast(expr, indent + 1, true)); // Pass true here
        },
        Node::Assignment { identifier, value } => {
            result.push_str(&format!("{}Assignment\n", indent_str));
            result.push_str(&format!("{}    Identifier: {}\n", indent_str, identifier));
            result.push_str(&pretty_ast(value, indent + 2, true)); // And true here too
        },
    }

    return result;
}
