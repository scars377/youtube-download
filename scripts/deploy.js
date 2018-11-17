const fs = require('fs');
const path = require('path');
const asar = require('asar');
const webpack = require('webpack');
const { ncp } = require('ncp');

const rendererConfig = require('../webpack.config');
const mainConfig = require('../webpack.main.config');

const electronPath = path.resolve(__dirname, '../electron');

const xcopy = () =>
  new Promise((resolve, reject) => {
    ncp(
      path.resolve(__dirname, '../node_modules/electron/dist'),
      electronPath,
      { clobber: false },
      (err) => (err ? reject(err) : resolve()),
    );
  });

const pack = () =>
  new Promise((resolve, reject) => {
    webpack([rendererConfig, mainConfig], (err, stats) => {
      if (err || stats.hasErrors()) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const createPackageJSON = () =>
  new Promise((resolve, reject) => {
    const packagePath = path.resolve(mainConfig.output.path, 'package.json');
    fs.writeFile(packagePath, '{"main":"main.js"}', 'utf8', (err) =>
      err ? reject(err) : resolve());
  });

const createAsar = () =>
  new Promise((resolve) => {
    asar.createPackage(
      path.resolve(mainConfig.output.path),
      path.resolve(electronPath, 'resources/app.asar'),
      () => resolve(),
    );
  });

const deploy = async () => {
  try {
    await xcopy();
    await pack();
    await createPackageJSON();
    await createAsar();
  } catch (err) {
    console.log(err);
  }
};
deploy();
