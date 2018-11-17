const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8081',
    },
  },

  // context: path.resolve('./src'),
  entry: path.resolve('./src/client/main.js'),
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
      template: path.resolve('./src/client/index.html'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('./src/client'),
        loader: 'babel-loader',
      },
    ],
  },
};
