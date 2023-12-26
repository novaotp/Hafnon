const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: 'development',
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
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'index.cjs',
    path: path.resolve(__dirname, 'build')
  },
};
