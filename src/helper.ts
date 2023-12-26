
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Token } from './frontend/token';
import { tokenToString } from './frontend/tokenType';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readSourceFile = (filename: string) => fs.readFileSync(path.join(__dirname, '..', filename), { encoding: "utf-8" });

/**
 * Serializes the data and writes it to the specified file.
 * @param filename The filename to write to
 * @param data The serializable data to write
 */
export const writeToFile = (filename: string, data: any) => {
    const outputPath = path.join(__dirname, '../output/', filename);
    const outputDirectory = path.dirname(outputPath);

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data), { encoding: 'utf-8' });
}

export const prettyTokens = (tokens: Token[]): string => {
    let printedTokens = "[\r\n";

    for (const token of tokens) {
        printedTokens += `\t{ Value : ${token.value} | Type : ${tokenToString(token.type)} | Length : ${token.length} | Position : ${token.position.toString()} }\n`;
    }

    printedTokens += "]\r\n";

    return printedTokens;
}
