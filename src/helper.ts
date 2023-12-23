
import fs from 'fs';
import path from 'path';
import { Token } from './frontend/lexer/Token';
import { tokenToString } from './frontend/lexer/TokenType';

export const readFromSource = () => fs.readFileSync(path.join(__dirname, '..', 'src.haf'), { encoding: "utf-8" });

export const writePrettyTokens = (tokens: Token[]): void => {
    let printedTokens = "[\n";

    for (const token of tokens) {
        printedTokens += `\t{ Value : ${token.value} | Type : ${tokenToString(token.type)} | Length : ${token.length} | Position : ${token.position.toString()} }\n`;
    }
    printedTokens += "]\n";

    fs.writeFileSync(path.join(__dirname, '..', 'tokens.txt'), printedTokens, { encoding: "utf-8" });
}
