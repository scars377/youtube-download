const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'eval',
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
