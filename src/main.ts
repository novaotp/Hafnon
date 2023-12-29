import { Lexer } from './frontend/lexer';
import { Parser } from './frontend/parser';
import { Semer } from './frontend/semer';
import { prettyTokens, readSourceFile, writeToFile } from './helper';

const sourceCode = readSourceFile("src.haf");

const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();

writeToFile("tokens.json", prettyTokens(tokens));

const parser = new Parser(tokens);
const ast = parser.produceAST();

writeToFile("ast.json", ast);

const semer = new Semer(ast.body, sourceCode);
semer.analyze();
