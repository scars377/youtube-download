const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: false,
  entry: path.resolve('./src/renderer/main.js'),
  output: {
    path: path.resolve('./build'),
    filename: 'renderer.js',
  },
  target: 'electron-renderer',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve('./src/renderer/index.html'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('./src/renderer'),
        loader: 'babel-loader',
      },
    ],
  },
};
