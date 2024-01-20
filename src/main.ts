import { Lexer } from './compilation/lexer';
import { Parser } from './compilation/parser';
import { Semer } from './compilation/semer';
import { prettyTokens, readSourceFile, writeToFile } from './helper';
import { Runtime } from './runtime';

function main() {
    const sourceCode = readSourceFile("src.haf");

    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();

    writeToFile("tokens.json", prettyTokens(tokens));

    const parser = new Parser(tokens, sourceCode);
    const ast = parser.produceAST();

    writeToFile("ast.json", ast);

    const semer = new Semer(ast.body, sourceCode);
    const logCount = semer.analyze();

    if (logCount > 0) {
        return;
    }

    const runtime = new Runtime(ast.body);
    runtime.execute();
}

main();
