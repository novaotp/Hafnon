
import fs from 'fs';
import path from 'path';

export const readSourceFile = (filename: string) => fs.readFileSync(path.join(__dirname, '..', filename), { encoding: "utf-8" });
export const writeToFile = (filename: string, data: any | (() => any)) => {
    const outputPath = path.join(__dirname, '../output/', filename);
    const outputDirectory = path.dirname(outputPath);

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    fs.writeFileSync(outputPath, typeof data === "function" ? data() : data, { encoding: 'utf-8' });
}
