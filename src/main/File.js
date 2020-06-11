const fs = require('fs');

module.exports = class File {
  constructor(filePath) {
    this.filePath = filePath;
  }

  createWriteStream() {
    return fs.createWriteStream(this.filePath, { flags: 'a' });
  }

  getSize() {
    return new Promise(resolve => {
      fs.stat(this.filePath, (err, stat) => resolve(err ? -1 : stat.size));
    });
  }

  remove() {
    return new Promise(resolve => {
      fs.unlink(this.filePath, () => resolve());
    });
  }

  toJSON() {
    return this.filePath;
  }
};
