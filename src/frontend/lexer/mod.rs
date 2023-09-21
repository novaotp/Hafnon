extern crate colored;
use colored::*;
use std::{panic, str::Chars};
use crate::frontend::position::Position;
use crate::frontend::token::Token;
use crate::frontend::token_type::TokenType;

/// Represents a lexical analyzer for tokenizing source code.
pub struct Lexer<'a> {
    /// The complete source code as a string.
    original_src: &'a str,
    /// An iterator over characters in the source code.
    chars: Chars<'a>,
    /// Tracks the current position within the source code.
    position: Position,
    /// A collection to store generated tokens.
    tokens: Vec<Token>,
    /// A list of conditional keywords in the language.
    conditionals: Vec<&'static str>,
    /// A list of loop keywords in the language.
    loops: Vec<&'static str>,
    /// A list of reserved keywords in the language.
    keywords: Vec<&'static str>,
    /// A list of variable modifiers in the language.
    var_modifiers: Vec<&'static str>,
    /// A list of built-in types in the language.
    types: Vec<&'static str>,
}

impl<'a> Lexer<'a> {
    /// Creates a new Lexer instance for a given source code.
    ///
    /// # Arguments
    ///
    /// * `src` - The source code to be tokenized.
    ///
    /// # Returns
    ///
    /// A new Lexer instance.
    pub fn new(src: &'a str) -> Self {
        Lexer {
            original_src: src,
            chars: src.chars(),
            position: Position { column: 1, line: 1 },
            tokens: Vec::new(),
            loops: vec!["while", "for"],
            conditionals: vec!["if", "else if", "else"],
            keywords: vec!["func"],
            var_modifiers: vec!["mutable"],
            types: vec!["int", "float", "string", "boolean"],
        }
    }

    /// Tokenizes numbers, differentiating between integers and floats.
    ///
    /// # Arguments
    ///
    /// * `char` - The starting character assumed to be part of a number.
    fn handle_numeric(&mut self, char: char) {
        let mut buffer = String::new();
        let mut has_decimal = false;
        let start_position = self.get_current_position();

        self.advance_column();
        buffer.push(char);

        while let Some(next_char) = self.chars.clone().next() {
            if !next_char.is_numeric() {
                break;
            }

            if next_char == '.' {
                if has_decimal {
                    break; // A second '.' breaks the loop
                } else {
                    has_decimal = true; // We've encountered a '.'
                }
            }

            self.advance_column();
            buffer.push(self.chars.next().unwrap());
        }

        let end_position = self.get_current_position();

        let token_type: TokenType = if has_decimal {
            TokenType::Float
        } else {
            TokenType::Integer
        };

        let token = Token::new(
            token_type,
            &buffer,
            start_position,
            end_position,
        );
        self.tokens.push(token);
    }

    /// Tokenizes strings enclosed in double quotes.
    ///
    /// Assumes that the opening quote will be skipped.
    fn handle_string(&mut self) {
        let mut buffer = String::new();
        let start_position = self.get_current_position();

        self.advance_column();

        while let Some(next_char) = self.chars.clone().next() {
            self.advance_column();

            if next_char == '"' {
                self.chars.next(); // Skip the closing quote
                break;
            }

            buffer.push(self.chars.next().unwrap());
        }

        let end_position = self.get_current_position();

        let token = Token::new(
            TokenType::String,
            &buffer,
            start_position,
            end_position,
        );
        self.tokens.push(token);
    }

    /// Tokenizes alphabetic strings, including keywords, variable modifiers, and identifiers.
    ///
    /// # Arguments
    ///
    /// * `char` - The starting character assumed to be part of an alphabetic string.
    fn handle_alpha(&mut self, char: char) {
        let mut buffer = String::new();
        let start_position = self.get_current_position();

        self.advance_column();
        buffer.push(char);

        while let Some(next_char) = self.chars.clone().next() {
            if !next_char.is_alphabetic() {
                break;
            }

            self.advance_column();
            buffer.push(self.chars.next().unwrap());
        }

        let end_position = self.get_current_position();

        let token_type: TokenType = if self.keywords.contains(&buffer.as_str()) {
            TokenType::Keyword
        } else if self.var_modifiers.contains(&buffer.as_str()) {
            TokenType::VarModifiers
        } else if ["true", "false"].contains(&buffer.as_str()) {
            TokenType::Boolean
        } else if self.types.contains(&buffer.as_str()) {
            TokenType::Type
        } else if self.conditionals.contains(&buffer.as_str()) {
            match buffer.as_str() {
                "if" => TokenType::If,
                "else" => {
                    let mut chars_clone = self.chars.clone();
                    if chars_clone.next().unwrap() == ' ' && chars_clone.next().unwrap() == 'i' && chars_clone.next().unwrap() == 'f' {
                        TokenType::ElseIf
                    } else {
                        TokenType::Else
                    }
                }
                _ => panic!("Unknown conditional")
            }
        } else if self.loops.contains(&buffer.as_str()) {
            match buffer.as_str() {
                "while" => TokenType::While,
                "for" => TokenType::For,
                _ => panic!("Unknown loop keyword")
            }
        } else {
            TokenType::Identifier
        };

        let token = Token::new(
            token_type,
            &buffer,
            start_position,
            end_position,
        );
        self.tokens.push(token);
    }

    /// Tokenizes various types of operators like logical, arithmetic, and comparison operators.
    ///
    /// # Arguments
    ///
    /// * `char` - The starting character assumed to be part of an operator.
    fn handle_operator(&mut self, char: char) {
        let mut buffer = String::new();
        let start_position = self.get_current_position();

        buffer.push(char);
        self.advance_column();

        if let Some(next_char) = self.chars.clone().next() {
            match (char, next_char) {
                ('=', '=')
                | ('!', '=')
                | ('>', '=')
                | ('<', '=')
                | ('&', '&')
                | ('|', '|')
                | ('/', '/') => {
                    self.advance_column();
                    buffer.push(self.chars.next().unwrap());
                }
                _ => {}
            }
        }

        let end_position = self.get_current_position();

        let token_type = match buffer.as_str() {
            "=" => TokenType::Assign,

            "+" => TokenType::Addition,
            "-" => TokenType::Subtraction,
            "*" => TokenType::Multiplication,
            "/" => TokenType::Division,
            "//" => TokenType::IntegerDivision,
            "%" => TokenType::Modulo,
            "^" => TokenType::Power,

            "==" => TokenType::Equal,
            "!=" => TokenType::NotEqual,
            ">" => TokenType::GreaterThan,
            ">=" => TokenType::GreaterOrEqual,
            "<" => TokenType::LessThan,
            "<=" => TokenType::LessOrEqual,

            "!" => TokenType::Not,
            "&6" => TokenType::And,
            "||" => TokenType::Or,

            _ => TokenType::Unknown,
        };

        let token = Token::new(
            token_type,
            &buffer,
            start_position,
            end_position,
        );
        self.tokens.push(token);
    }

    /// Tokenizes delimiters such as semicolons, dots, colons, and commas.
    ///
    /// # Arguments
    ///
    /// * `char` - The character that represents a delimiter.
    fn handle_delimiter(&mut self, char: char) {
        let start_position = self.get_current_position();
        self.advance_column();

        let token_type = match char {
            ';' => TokenType::SemiColon,
            '.' => TokenType::Dot,
            ':' => TokenType::Colon,
            ',' => TokenType::Comma,
            _ => TokenType::Unknown,
        };

        let end_position = self.get_current_position();

        let token = Token::new(
            token_type,
            &char.to_string(),
            start_position,
            end_position,
        );
        self.tokens.push(token);
    }

    fn handle_braces(&mut self, char: char) {
        let start_position = self.get_current_position();
        self.advance_column();

        let token_type = match char {
            '(' => TokenType::LeftParen,
            ')' => TokenType::RightParen,
            '[' => TokenType::LeftBracket,
            ']' => TokenType::RightBracket,
            '{' => TokenType::LeftBrace,
            '}' => TokenType::RightBrace,
            _ => TokenType::Unknown,
        };

        let end_position = self.get_current_position();

        let token = Token::new(
            token_type,
            &char.to_string(),
            start_position,
            end_position,
        );
        self.tokens.push(token);
    }

    /// Skips over comments in the source code.
    ///
    /// Supports both single-line and multi-line comments.
    ///
    /// # Arguments
    ///
    /// * `char` - The starting character that indicates a comment.
    fn handle_comments(&mut self, char: char) {
        if char == '#' {
            // Single-line comment
            while let Some(c) = self.chars.clone().next() {
                if c == '\n' {
                    break; // Comment ends with a new line
                }
                self.advance_column();
                self.chars.next();
            }
        } else {
            // Multi-line comment
            self.advance_column(); // To consume the '*'
            let mut prev_char = self.chars.next().unwrap(); // Advance to next character

            loop {
                if let Some(char) = self.chars.next() {
                    self.advance_column();

                    // Comment ends with */
                    if prev_char == '*' && char == '/' {
                        break;
                    }
                    if char == '\n' {
                        self.reset_column();
                        self.advance_line();
                    }
                    prev_char = char;
                } else {
                    // Reaching here means EOF before comment was closed
                    self.throw_error(
                        "Syntax error",
                        "Unclosed multi-line comment",
                        "Did you forget to close the multi-line comment ?",
                        self.position.column,
                        self.position.line,
                    );
                }
            }
        }
    }

    /// Throws a compile-time error and halts execution.
    ///
    /// # Arguments
    ///
    /// * `error_type` - Category of the error.
    /// * `message` - Detailed error message.
    /// * `hint` - Suggestion to resolve the error.
    /// * `column` - Column number where the error occurred.
    /// * `line` - Line number where the error occurred.
    pub fn throw_error(
        &self,
        error_type: &str,
        message: &str,
        hint: &str,
        column: i32,
        line: i32,
    ) -> ! {
        panic::set_hook(Box::new(|_| {})); // This is empty, meaning it will do nothing when a panic occurs.

        let lines: Vec<&str> = self.original_src.split('\n').collect();
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

    /// Gets the current position in the source code.
    ///
    /// # Returns
    ///
    /// A Position struct representing the current line and column.
    pub fn get_current_position(&self) -> Position {
        return Position { column: self.position.column, line: self.position.line };
    }

    /// Moves to the next column in the current line.
    pub fn advance_column(&mut self) {
        self.position.column += 1;
    }

    /// Resets the column number to 1.
    pub fn reset_column(&mut self) {
        self.position.column = 1;
    }

    /// Moves to the next line and resets the column number.
    pub fn advance_line(&mut self) {
        self.position.line += 1;
    }

    /// Initiates the tokenization process.
    ///
    /// # Returns
    ///
    /// A vector containing all the generated tokens.
    pub fn tokenize(&mut self) -> &Vec<Token> {
        while let Some(char) = self.chars.next() {
            if char.is_numeric() {
                self.handle_numeric(char);
            } else if char == '"' {
                self.handle_string();
            } else if char.is_alphabetic() {
                self.handle_alpha(char);
            } else if char.is_whitespace() {
                self.advance_column();

                if char == '\n' {
                    self.reset_column();
                    self.advance_line();
                }
                continue;
            } else if char == '#' || (char == '/' && self.chars.clone().next().unwrap() == '*') {
                self.handle_comments(char);
            } else if ['=', '!', '>', '<', '+', '-', '*', '/', '&', '|', '%', '^'].contains(&char) {
                self.handle_operator(char);
            } else if [';', '.', ':', ','].contains(&char) {
                self.handle_delimiter(char);
            } else if ['(', ')', '[', ']', '{', '}'].contains(&char) {
                self.handle_braces(char);
            } else {
                self.throw_error(
                    "Type error",
                    "Unknown token encountered",
                    "Valid token",
                    self.position.column,
                    self.position.line
                );
            }
        }

        let start_position = self.get_current_position();
        self.advance_column();
        let end_position = self.get_current_position();

        let end_token = Token::new(
            TokenType::EOF,
            "End Of File",
            start_position,
            end_position,
        );
        self.tokens.push(end_token);

        return &self.tokens;
    }
}
