import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: Configuration = {
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
        path: resolve(__dirname, 'build'),
        filename: 'index.js',
        module: true,
    },
    externals: [
        nodeExternals({
            modulesDir: join(__dirname, 'node_modules'),
            importType: (moduleName: string) => `import ${moduleName}`,
        }),
    ],
    plugins: [
        new NodePolyfillPlugin()
    ]
}

export default config;
