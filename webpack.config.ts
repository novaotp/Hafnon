import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: webpack.Configuration = {
    entry: './src/main.ts',
    mode: 'development',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    experiments: {
        outputModule: true,
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        module: true,
    },
    externals: [
        nodeExternals({
            modulesDir: path.join(__dirname, 'node_modules'),
            importType: (moduleName: string) => `import ${moduleName}`,
        }),
    ],
    plugins: [
        new NodePolyfillPlugin()
    ]
}

export default config;
