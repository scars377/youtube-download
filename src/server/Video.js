const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const filenamify = require('filenamify');
const { EventEmitter } = require('events');

const ITAG = 251;

const Status = {
  Init: 'Init',
  Invalid: 'Invalid',
  GetInfo: 'GetInfo',
  GetInfoComplete: 'GetInfoComplete',
  GetFileStat: 'GetFileStat',
  GetFileStatComplete: 'GetFileStatComplete',
  Download: 'Download',
  DownloadComplete: 'DownloadComplete',
  Encode: 'Encode',
  Completed: 'Completed',
};

const getFileSize = (filePath) =>
  new Promise((resolve) =>
    fs.stat(filePath, (err, stat) => resolve(err ? -1 : stat.size)));

class Video extends EventEmitter {
  constructor(props, onStatus) {
    super();
    const {
      id = '',
      title = '',
      thumbnail = '',
      lengthSeconds = 0,
      webmSizeTotal = 0,
      status = Status.Init,
      webmPath = '',
      mp3Path = '',
      webmSize = -1,
      mp3Size = -1,
      progress = 0,
    } = props;
    this.id = id;
    this.title = title;
    this.thumbnail = thumbnail;
    this.lengthSeconds = lengthSeconds;
    this.webmSizeTotal = webmSizeTotal;
    this._status = status;
    this.webmPath = webmPath;
    this.mp3Path = mp3Path;
    this.webmSize = webmSize;
    this.mp3Size = mp3Size;
    this.progress = progress;
    this.onStatus = onStatus;
    setImmediate(() => this.run());
  }

  set status(s) {
    this._status = s;
    this.onStatus();
  }

  get status() {
    return this._status;
  }

  async run() {
    switch (this.status) {
      case Status.Init:
      case Status.GetInfo:
        await this.getInfo();
        break;
      case Status.GetInfoComplete:
      case Status.GetFileStat:
        await this.getFileState();
        break;
      case Status.GetFileStatComplete:
      case Status.Download:
        await this.download();
        break;
      case Status.DownloadComplete:
      case Status.Encode:
        await this.encode();
        break;
      default:
        return;
    }
    this.run();
  }

  getInfo() {
    this.status = Status.GetInfo;
    return new Promise((resolve, reject) =>
      ytdl.getBasicInfo(this.id, (err, info) => {
        if (err) {
          this.status = Status.Invalid;
          reject(err);
          return;
        }
        const {
          player_response: {
            videoDetails: {
              title,
              thumbnail: {
                thumbnails: [{ url: thumbnail }],
              },
              lengthSeconds,
            },
            streamingData: { adaptiveFormats },
          },
        } = info;
        const { contentLength } = adaptiveFormats.find((f) => f.itag === ITAG);
        const webmSizeTotal = parseInt(contentLength, 10);

        this.title = title;
        this.thumbnail = thumbnail;
        this.lengthSeconds = parseInt(lengthSeconds, 10);
        this.webmSizeTotal = webmSizeTotal;

        const fileName = filenamify(title, { replacement: '-' });
        this.webmPath = path.resolve(Video.path, `${fileName}.webm`);
        this.mp3Path = path.resolve(Video.path, `${fileName}.mp3`);

        this.status = Status.GetInfoComplete;
        resolve();
      }));
  }

  async getFileState() {
    this.status = Status.GetFileStat;
    this.webmSize = await getFileSize(this.webmPath);
    this.mp3Size = await getFileSize(this.mp3Path);

    if (this.mp3Size !== -1 && this.webmSize === -1) {
      this.progress = 100;
      this.status = Status.Completed;
    } else if (this.webmSize === this.webmSizeTotal) {
      this.status = Status.DownloadComplete;
    } else {
      this.status = Status.GetFileStatComplete;
    }
  }

  download() {
    this.status = Status.Download;
    return new Promise((resolve) => {
      const { webmSize: size, webmSizeTotal: sizeTotal } = this;
      const options = {
        quality: ITAG,
        range: {
          start: size === -1 ? 0 : size,
          end: sizeTotal,
        },
      };
      // debugger;
      const dl = ytdl(this.id, options);
      dl.on('progress', (chunk, bytesLoaded, bytesTotal) => {
        this.progress = parseInt(
          (100 * (size + bytesLoaded)) / (size + bytesTotal),
          10,
        );
        this.onStatus();
      });
      const stream = fs.createWriteStream(this.webmPath, { flags: 'a' });
      stream.on('finish', () => {
        this.progress = 100;
        this.status = Status.DownloadComplete;
        resolve();
      });
      dl.pipe(stream);
    });
  }

  encode() {
    this.status = Status.Encode;
    return new Promise((resolve) => {
      ffmpeg()
        .input(this.webmPath)
        .output(this.mp3Path)
        .on('progress', (e) => {
          this.progress = parseInt(Math.min(100, e.percent), 10);
          this.onStatus();
        })
        .on('end', (err) => {
          if (err) return;
          fs.unlink(this.webmPath, () => {
            this.progress = 100;
            this.status = Status.Completed;
            resolve();
          });
        })
        .run();
    });
  }

  toJSON() {
    const {
      id = '',
      title = '',
      thumbnail = '',
      lengthSeconds = 0,
      status = Status.Init,
      webmSizeTotal = 0,
      webmPath = '',
      mp3Path = '',
      webmSize = -1,
      mp3Size = -1,
      progress = 0,
    } = this;
    return {
      id,
      title,
      thumbnail,
      lengthSeconds,
      status,
      webmSizeTotal,
      webmPath,
      mp3Path,
      webmSize,
      mp3Size,
      progress,
    };
  }

  toString() {
    return JSON.stringify(this);
  }
}

Video.path = '';
Video.Status = Status;

module.exports = Video;
