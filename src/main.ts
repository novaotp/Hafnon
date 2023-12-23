import { Lexer } from './frontend/lexer';
import { readFromSource, writePrettyTokens } from './helper';

const lexer = new Lexer(readFromSource());
const tokens = lexer.tokenize();

writePrettyTokens(tokens);
