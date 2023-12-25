
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Token } from './frontend/token.js';
import { tokenToString } from './frontend/tokenType.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readSourceFile = (filename: string) => fs.readFileSync(path.join(__dirname, '..', filename), { encoding: "utf-8" });

export const writeToFile = (filename: string, data: any) => {
    const outputPath = path.join(__dirname, '../output/', filename);
    const outputDirectory = path.dirname(outputPath);

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    fs.writeFileSync(outputPath, data, { encoding: 'utf-8' });
}

export const prettyTokens = (tokens: Token[]): string => {
    let printedTokens = "[\n";

    for (const token of tokens) {
        printedTokens += `\t{ Value : ${token.value} | Type : ${tokenToString(token.type)} | Length : ${token.length} | Position : ${token.position.toString()} }\n`;
    }

    printedTokens += "]\n";

    return printedTokens;
}
