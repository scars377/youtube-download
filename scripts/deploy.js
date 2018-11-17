const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const rendererConfig = require('../webpack.config');
const mainConfig = require('../webpack.main.config');

fs.copyFile(path.resolve(__dirname, '../node_modules/electron/dist'),path.resolve(__dirname.'../electron'))

webpack([rendererConfig, mainConfig], (err, stats) => {
  if (err || stats.hasErrors()) {
    // Handle errors here
  }
  const packagePath = path.resolve(mainConfig.output.path, 'package.json');
  fs.writeFileSync(packagePath, '{"main":"main.js"}', 'utf8');
});
