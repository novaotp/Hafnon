import { Lexer } from './frontend/lexer';
import { Parser } from './frontend/parser';
import { tokenToString } from './frontend/tokenType';
import { readSourceFile, writeToFile } from './helper';

const sourceCode = readSourceFile("src.haf");

const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();

writeToFile("tokens.txt", () => {
    let printedTokens = "[\n";

    for (const token of tokens) {
        printedTokens += `\t{ Value : ${token.value} | Type : ${tokenToString(token.type)} | Length : ${token.length} | Position : ${token.position.toString()} }\n`;
    }

    printedTokens += "]\n";

    return printedTokens;
});

const parser = new Parser(tokens);
const ast = parser.produceAST();

writeToFile("ast.txt", ast);
