const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: path.resolve('./src/server/app.js'),
  output: {
    path: path.resolve('./build'),
    filename: 'main.js',
  },
  target: 'electron-main',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};
