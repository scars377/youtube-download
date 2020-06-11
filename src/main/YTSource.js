const ytdl = require('ytdl-core');

module.exports = class YTSource {
  constructor({ id, itag, contentLength, file }) {
    this.id = id;
    this.itag = itag;
    this.contentLength = contentLength;
    this.file = file;
  }

  download(onProgress) {
    const { id, itag, file, contentLength } = this;

    return new Promise(async (resolve) => {
      const bytesLoaded = await file.getSize();
      onProgress(bytesLoaded, contentLength);

      const options = {
        quality: itag,
        range: {
          start: bytesLoaded === -1 ? 0 : bytesLoaded,
          end: contentLength,
        },
      };

      const stream = file.createWriteStream();
      stream.on('finish', () => resolve());

      const dl = ytdl(id, options);
      dl.on('progress', (chunk, chunkBytesLoaded /* , chunkBytesTotal */) => {
        onProgress(bytesLoaded + chunkBytesLoaded, contentLength);
      });
      dl.pipe(stream);
    });
  }
};
