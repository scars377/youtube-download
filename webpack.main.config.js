const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: path.resolve('./src/main/main.js'),
  output: {
    path: path.resolve('./build'),
    filename: 'main.js',
  },
  target: 'electron-main',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.FLUENTFFMPEG_COV': false,
    }),
  ],
};
