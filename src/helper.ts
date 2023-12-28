
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Token } from './frontend/token';
import { tokenToString } from './frontend/tokenType';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Reads from a file and returns its content.
 * @param path The relative path of the file from the root directory
 */
export const readSourceFile = (path: string) => fs.readFileSync(join(__dirname, path), { encoding: "utf-8" });

/**
 * Serializes the data and writes it to the specified file.
 * @param filename The filename to write to
 * @param data The serializable data to write
 */
export const writeToFile = (filename: string, data: any) => {
    const outputPath = join(__dirname, '/output/', filename);
    const outputDirectory = dirname(outputPath);

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    fs.writeFileSync(outputPath, data, { encoding: 'utf-8', flag: 'w' });
}

export const prettyTokens = (tokens: Token[]) => {
    let printedTokens = [];

    for (const token of tokens) {
        printedTokens.push({ "value" : token.value, "type" : tokenToString(token.type), "length" : token.length, "position" : { column: token.position.column, line: token.position.line }});
    }

    return printedTokens;
}
