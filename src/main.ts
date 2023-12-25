import { Lexer } from './frontend/lexer/index.js';
import { Parser } from './frontend/parser/index.js';
import { prettyTokens, readSourceFile, writeToFile } from './helper.js';

const sourceCode = readSourceFile("src.haf");

const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();

writeToFile("tokens.txt", prettyTokens(tokens));

const parser = new Parser(tokens, sourceCode);
const ast = parser.produceAST();

writeToFile("ast.txt", JSON.stringify(ast));
