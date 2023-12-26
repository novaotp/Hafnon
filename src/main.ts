import { Lexer } from './frontend/lexer';
import { Parser } from './frontend/parser';
import { prettyTokens, readSourceFile, writeToFile } from './helper';

const sourceCode = readSourceFile("src.haf");

const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();

writeToFile("tokens.txt", prettyTokens(tokens));

const parser = new Parser(tokens, sourceCode);
const ast = parser.produceAST();

writeToFile("ast.txt", ast);
