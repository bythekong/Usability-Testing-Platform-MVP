const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const apiBaseUrl = process.env.EXTENSION_API_URL || 'http://localhost:4000';
const webOrigins = (process.env.WEB_APP_ORIGINS || 'http://localhost/*')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

module.exports = {
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    popup: './src/popup.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      __API_BASE_URL__: JSON.stringify(apiBaseUrl),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          transform(content, absolutePath) {
            if (!absolutePath.endsWith('manifest.json')) return content;
            const manifest = JSON.parse(content.toString());
            manifest.externally_connectable = { matches: webOrigins };
            return Buffer.from(JSON.stringify(manifest, null, 2));
          },
        },
      ],
    }),
  ],
};
