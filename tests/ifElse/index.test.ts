import fs from 'fs';
import { Lexer } from "@compilation/lexer";
import path from 'path';

it("tests if-elif-else branches", () => {
    const sourceCode = fs.readFileSync(path.join(__dirname, "./source.haf"), { encoding: "utf-8" });
    const expected = fs.readFileSync(path.join(__dirname, "./expected.json"), { encoding: "utf-8" });

    const lexer = new Lexer(sourceCode);
    const tokens = JSON.stringify(lexer.tokenize());

    expect(tokens).toEqual(expected);
});
