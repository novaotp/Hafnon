extern crate colored;
use colored::*;
use std::panic;
use crate::frontend::ast::Node;
use crate::frontend::token::Token;
use crate::frontend::token_type::TokenType;

/// Parser struct to hold the source code, tokens and the current position.
pub struct Parser<'a> {
    // The original source text
    original_src: &'a str,
    // The list of tokens to parse
    tokens: &'a [Token],
    // The current index
    index: usize,
}

impl<'a> Parser<'a> {
    /// Constructs a new `Parser` instance.
    pub fn new(original_src: &'a str, tokens: &'a [Token]) -> Self {
        Parser { original_src, tokens, index: 0 }
    }

    /// Retrieves the current token being processed.
    fn current_token(&self) -> &Token {
        &self.tokens[self.index]
    }

    /// Advances the parser to the next token.
    fn advance(&mut self) {
        self.index += 1;
    }

    /// Custom error handling for the parser.
    pub fn throw_error(
        &self,
        error_type: &str,
        message: &str,
        hint: &str,
        token: &Token,
    ) -> ! {
        panic::set_hook(Box::new(|_| {})); // This is empty, meaning it will do nothing when a panic occurs.

        let lines: Vec<&str> = self.original_src.split('\n').collect();
        let line = token.start_position.line;
        let column = token.start_position.column;
        let context = lines.get((line - 1) as usize).unwrap_or(&""); // Adjust index here

        println!();
        println!(
            "{} at Line {}, Column {}: ",
            "Error".red(),
            line.to_string().green(),
            column.to_string().green()
        );

        println!();
        println!("\t{}", context);
        println!("\t{}^", " ".repeat((column - 1) as usize));
        println!("{} : {}", "Why".red(), message);
        println!("{} : {}", "Error type".red(), error_type);
        println!();
        println!("{} : {}", "Hint".red(), hint);
        println!();

        panic!();
    }

    /// Entry point to begin the parsing process.
    pub fn produce_ast(&mut self) -> Node {
        let mut program: Vec<Box<Node>> = Vec::new();

        while self.index < self.tokens.len() {
            let statement: Box<Node> = Box::new(self.parse());
            program.push(statement);

            if self.index < self.tokens.len() {
                match self.tokens[self.index].token_type {
                    TokenType::EOF => break,
                    _ => continue,
                }
            }
        }

        return Node::Program { expressions: program };
    }

    /// Parses individual statements in the source code.
    fn parse(&mut self) -> Node {
        return match &self.current_token().token_type {
            TokenType::VarModifiers | TokenType::Type => self.parse_declaration(),
            TokenType::Identifier => self.parse_assignment_or_function(),
            TokenType::While => self.parse_while_loop(),
            TokenType::ForEach => self.parse_foreach_loop(),
            _ => self.parse_expr(),
        }
    }

    /// Parses variable declarations.
    fn parse_declaration(&mut self) -> Node {
        let is_mutable: bool = if self.tokens[self.index].token_type == TokenType::VarModifiers {
            self.advance();
            true
        } else {
            false
        };
        let var_type: String = self.current_token().value.clone();
        self.advance(); // Consume the type
        let identifier: String = self.current_token().value.clone();
        self.advance(); // Consume the identifier

        let value: Node = if let TokenType::Assign = self.current_token().token_type {
            self.advance(); // Consume the '='
            self.parse_expr()
        } else {
            if !is_mutable {
                self.throw_error(
                    "InitializationError",
                    "Non-mutable variables must be initialized",
                    "Make sure to provide an initial value for immutable variables",
                    &self.tokens[self.index]
                );  // Throw an error for non-mutable variables without an initial value
            }
            Node::String { value: "undefined".to_string() }
        };

        // Ensure to consume the semicolon at the end of the statement
        if self.current_token().token_type != TokenType::SemiColon {
            panic!("Expected a semi-colon");
        }

        self.advance();

        return Node::Declaration { is_mutable, var_type: var_type.clone(), identifier: identifier.clone(), initializer: Box::new(value) };
    }

    /// Determines whether an identifier leads to an assignment or a function call.
    fn parse_assignment_or_function(&mut self) -> Node {
        return match self.tokens[self.index + 1].token_type {
            TokenType::Assign => self.parse_assignment(),
            /*TokenType::LeftParen => Node::Expression(self.parse_function()),*/
            _ => self.throw_error("SyntaxError", &*format!("Expected '=' or '(', got {}", self.current_token().value.as_str()), "I'm not too sure", self.current_token())
        }
    }

    /// Parses assignment statements.
    fn parse_assignment(&mut self) -> Node {
        let identifier: &String = &self.tokens[self.index].value;
        self.advance(); // Consume the identifier

        if self.current_token().token_type != TokenType::Assign {
            panic!("Expected an assignment token '='");
        }

        self.advance(); // Consume the '='
        let value: Node = self.parse_expr();

        // Ensure to consume the semicolon at the end of the statement
        if self.current_token().token_type != TokenType::SemiColon {
            panic!("Expected a semi-colon");
        }
        self.advance();

        return Node::from(Node::Assignment { identifier: identifier.clone(), value: Box::new(value) });
    }

    /*fn parse_function(&mut self) -> Expr {
        return Expr::String("undefined".to_string());
    }*/

    fn parse_while_loop(&mut self) -> Node {
        self.advance(); // Consume the while keyword

        if self.current_token().token_type != TokenType::LeftParen {
            self.throw_error(
                "SyntaxError",
                "'while' keyword must be followed by '('",
                "Make sure to add parenthesis around your while condition.",
                &self.tokens[self.index]
            );
        }

        self.advance();

        let mut condition: Vec<Box<Node>> = Vec::new();
        while self.current_token().token_type != TokenType::RightParen {
            condition.push(Box::new(self.parse_expr()));
        };

        self.advance();

        if self.current_token().token_type != TokenType::LeftBrace {
            self.throw_error(
                "SyntaxError",
                format!("'while' condition must be followed by '{{', got {}", self.current_token().value).as_str(),
                "Make sure to add braces around your while block.",
                &self.tokens[self.index]
            );
        }

        self.advance();

        let mut statements: Vec<Box<Node>> = Vec::new();
        while self.current_token().token_type != TokenType::RightBrace {
            let statement = Box::new(self.parse());
            statements.push(statement);
        }

        if self.current_token().token_type != TokenType::RightBrace {
            self.throw_error(
                "SyntaxError",
                "'while' condition must be followed by '{'",
                "Make sure to add braces around your while block.",
                &self.tokens[self.index]
            );
        }

        self.advance();

        return Node::While { condition, block: statements }
    }

    fn parse_foreach_loop(&mut self) -> Node {
        self.advance(); // Consume the foreach keyword

        if self.current_token().token_type != TokenType::LeftParen {
            self.throw_error(
                "SyntaxError",
                "'foreach' keyword must be followed by '('",
                "Make sure to add parenthesis around your foreach iterator.",
                &self.tokens[self.index]
            );
        }

        self.advance(); // Consume the (

        if self.current_token().token_type != TokenType::Type {
            self.throw_error(
                "TypeError",
                "Type expected for the iterated variable.",
                "Make sure to add a type to your iterated variable.",
                &self.tokens[self.index]
            );
        }

        let typ = self.current_token().value.clone();
        self.advance();

        let identifier = self.current_token().value.clone();
        self.advance();

        if self.current_token().token_type != TokenType::In {
            self.throw_error(
                "SyntaxError",
                "Expected an 'in' keyword.",
                "Make sure to add an 'in' keyword between the iterated and the iterable.",
                &self.tokens[self.index]
            );
        }

        self.advance();

        let collection = self.current_token().value.clone();
        self.advance();

        if self.current_token().token_type != TokenType::RightParen {
            self.throw_error(
                "SyntaxError",
                "Expected an ')' keyword.",
                "Make sure to add an ')' after the foreach declaration.",
                &self.tokens[self.index]
            );
        };

        self.advance();

        if self.current_token().token_type != TokenType::LeftBrace {
            self.throw_error(
                "SyntaxError",
                format!("'foreach' condition must be followed by '{{', got {}", self.current_token().value).as_str(),
                "Make sure to add braces around your foreach block.",
                &self.tokens[self.index]
            );
        }

        self.advance();

        let mut statements: Vec<Box<Node>> = Vec::new();
        while self.current_token().token_type != TokenType::RightBrace {
            let statement = Box::new(self.parse());
            statements.push(statement);
        }

        if self.current_token().token_type != TokenType::RightBrace {
            self.throw_error(
                "SyntaxError",
                "'foreach' condition must be close with '}'",
                "Make sure to add braces around your foreach block.",
                &self.tokens[self.index]
            );
        }

        self.advance();

        return Node::ForEach {
            item_type: Box::from(typ),
            item_name: Box::from(identifier),
            collection: Box::from(collection),
            block: statements
        }
    }

    // Parse an expression
    fn parse_expr(&mut self) -> Node {
        return self.parse_comparison();
    }

    fn parse_vector(&mut self) -> Node {
        if self.current_token().token_type != TokenType::LeftBracket {
            self.throw_error(
                "SyntaxError",
                "Expected '[' in vector declaration.",
                &format!("Got unexpected token: {}", self.current_token().value),
                &self.tokens[self.index]
            );
        }
        self.advance();

        let mut items: Vec<Box<Node>> = Vec::new();

        while self.current_token().token_type != TokenType::RightBracket {
            items.push(Box::new(self.parse_expr()));

            if self.current_token().token_type == TokenType::Comma {
                self.advance(); // Consume comma
            } else if self.current_token().token_type != TokenType::RightBracket {
                self.throw_error(
                    "SyntaxError",
                    "Expected ',' or ']' in vector declaration.",
                    &format!("Got unexpected token: {}", self.current_token().value),
                    &self.tokens[self.index]
                );
            }
        }

        if self.current_token().token_type != TokenType::RightBracket {
            self.throw_error(
                "SyntaxError",
                "Expected ']' in vector declaration.",
                &format!("Got unexpected token: {}", self.current_token().value),
                &self.tokens[self.index]
            );
        }
        self.advance();

        return Node::Vector { items }
    }

    /// Parses comparison expressions.
    fn parse_comparison(&mut self) -> Node {
        let mut node: Node = self.parse_term();

        loop {
            let token_type: &TokenType = &self.current_token().token_type;

            if ![TokenType::Equal, TokenType::NotEqual, TokenType::GreaterThan, TokenType::GreaterOrEqual, TokenType::LessThan, TokenType::LessOrEqual].contains(&token_type) {
                break;
            }

            let sign: TokenType = self.current_token().token_type.clone();
            self.advance();
            let right: Node = self.parse_term();

            node = match sign {
                TokenType::Equal => Node::Equal { left: Box::new(node), right: Box::new(right) },
                TokenType::NotEqual => Node::NotEqual { left: Box::new(node), right: Box::new(right) },
                TokenType::GreaterThan => Node::GreaterThan { left: Box::new(node), right: Box::new(right) },
                TokenType::GreaterOrEqual => Node::GreaterThan { left: Box::new(node), right: Box::new(right) },
                TokenType::LessThan => Node::LessThan { left: Box::new(node), right: Box::new(right) },
                TokenType::LessOrEqual => Node::LessOrEqual { left: Box::new(node), right: Box::new(right) },
                _ => panic!("Unknown operator"),
            }
        }

        return node;
    }

    /// Parses term expressions.
    fn parse_term(&mut self) -> Node {
        let mut node: Node = self.parse_factor();

        loop {
            let token_type: &TokenType = &self.current_token().token_type;

            if ![TokenType::Addition, TokenType::Subtraction].contains(&token_type) {
                break;
            }

            let sign: TokenType = self.current_token().token_type.clone();
            self.advance();
            let right: Node = self.parse_factor();

            node = match sign {
                TokenType::Addition => Node::Addition { left: Box::new(node), right: Box::new(right) },
                TokenType::Subtraction => Node::Subtraction { left: Box::new(node), right: Box::new(right) },
                _ => panic!("Unknown operator"),
            }
        }

        return node;
    }

    /// Parses factor expressions.
    fn parse_factor(&mut self) -> Node {
        let mut node: Node = self.parse_exponents();

        loop {
            let token_type: &TokenType = &self.current_token().token_type;

            if ![TokenType::Multiplication, TokenType::Division, TokenType::IntegerDivision, TokenType::Modulo].contains(&token_type) {
                break;
            }

            let sign: TokenType = self.current_token().token_type.clone();
            self.advance();
            let right: Node = self.parse_exponents();

            node = match sign {
                TokenType::Multiplication => Node::Multiplication { left: Box::new(node), right: Box::new(right) },
                TokenType::Division => Node::Division { left: Box::new(node), right: Box::new(right) },
                TokenType::IntegerDivision => Node::IntegerDivision { left: Box::new(node), right: Box::new(right) },
                TokenType::Modulo => Node::Modulo { left: Box::new(node), right: Box::new(right) },
                _ => panic!("Unknown operator"),
            }
        }

        return node;
    }

    /// Parses exponents expressions.
    fn parse_exponents(&mut self) -> Node {
        let mut node: Node = self.parse_unary();

        loop {
            let token_type: &TokenType = &self.current_token().token_type;

            if ![TokenType::Power].contains(&token_type) {
                break;
            }

            self.advance();
            let right: Node = self.parse_unary();

            node = Node::Power { left: Box::new(node), right: Box::new(right) };
        }

        return node;
    }

    /// Check if the expression is a valid unary expression.
    fn is_unary_context(&self) -> bool {
        if self.index == 0 {
            return true;
        }
        match self.tokens[self.index].token_type {
            TokenType::Addition | TokenType::Subtraction => true,
            _ => false,
        }
    }

    /// Parses unary expressions.
    fn parse_unary(&mut self) -> Node {
        return if self.is_unary_context() {
            match &self.current_token().token_type {
                TokenType::Addition => {
                    self.advance();
                    Node::UnaryPlus { expr: Box::new(self.parse_unary()) }
                },
                TokenType::Subtraction => {
                    self.advance();
                    Node::UnaryMinus { expr: Box::new(self.parse_unary()) }
                },
                _ => self.parse_primitive(),
            }
        } else {
            self.parse_primitive()
        }
    }

    fn parse_parentheses(&mut self) -> Node {
        if self.current_token().token_type != TokenType::LeftParen {
            self.throw_error(
                "SyntaxError",
                "Expected '('",
                &format!("Got unexpected token: {}", self.current_token().value),
                &self.tokens[self.index]
            );
        }
        self.advance(); // Consume '('

        let node = self.parse_expr(); // Parse the expression inside the parentheses

        if self.current_token().token_type != TokenType::RightParen {
            self.throw_error(
                "SyntaxError",
                "Expected ')'",
                &format!("Got unexpected token: {}", self.current_token().value),
                &self.tokens[self.index]
            );
        }
        self.advance(); // Consume ')'

        return node;
    }

    /// Parses primitives.
    fn parse_primitive(&mut self) -> Node {
        match self.current_token().token_type {
            TokenType::LeftBracket => return self.parse_vector(),
            TokenType::LeftParen => return self.parse_parentheses(),
            TokenType::Integer => {
                let value: i64 = self.tokens[self.index].value.parse::<i64>().unwrap();
                self.advance();
                return Node::Integer { value };
            }
            TokenType::Float => {
                let value: f64 = self.tokens[self.index].value.parse::<f64>().unwrap();
                self.advance();
                return Node::Float { value };
            }
            TokenType::String => {
                let value: String = self.tokens[self.index].value.parse::<String>().unwrap();
                self.advance();
                return Node::String { value };
            }
            TokenType::Boolean => {
                let value: bool = self.tokens[self.index].value.parse::<bool>().unwrap();
                self.advance();
                return Node::Boolean { value };
            }
            _ => {
                let token = self.current_token();
                self.throw_error("Unknown Token Error", "Unexpected token", "I can't really help. You're on your own bro.", token);
            }
        }
    }
}

