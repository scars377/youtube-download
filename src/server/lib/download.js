const ytdl = require('ytdl-core');
const filenamify = require('filenamify');
const fs = require('fs');
const path = require('path');

const ITAG = 251;

const getFileSize = (filePath) =>
  new Promise((resolve) => {
    fs.stat(filePath, (err, stat) => resolve(err ? 0 : stat.size));
  });

const getVideoSize = (info) => {
  const fmts = info.player_response.streamingData.adaptiveFormats;
  const { contentLength } = fmts.find((f) => f.itag === ITAG);
  return parseInt(contentLength, 10);
};

module.exports = async (videoId, dir, onProgress) => {
  const info = await ytdl.getBasicInfo(videoId);
  const sizeTotal = getVideoSize(info);
  const fileName = filenamify(info.title, { replacement: '-' });
  const filePath = path.resolve(dir, `${fileName}.mp3`);
  const size = await getFileSize(filePath);
  if (size === sizeTotal) {
    onProgress(1);
  } else {
    const dl = ytdl(videoId, {
      quality: ITAG,
      range: {
        start: size,
        end: sizeTotal,
      },
    });
    dl.on('progress', (chunk, bytesLoaded, bytesTotal) => {
      onProgress((size + bytesLoaded) / (size + bytesTotal));
    });
    dl.pipe(fs.createWriteStream(filePath, { flags: 'a' }));
  }
};
