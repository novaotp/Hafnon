mod frontend;

use std::fs;
use frontend::lexer::Lexer;
use frontend::token::Token;
use crate::frontend::ast::{Node, pretty_ast};
use crate::frontend::parser::Parser;

fn main() {
    let text: &String = &fs::read_to_string("src.haf").unwrap();

    let mut lexer: Lexer = Lexer::new(text);
    let tokens: &Vec<Token> = lexer.tokenize();

    /* println!("{:?}\n", tokens); */

    let mut parser: Parser = Parser::new(text, tokens);
    let ast: Node = parser.produce_ast();

    println!("{}", pretty_ast(&ast, 0, false));
}
