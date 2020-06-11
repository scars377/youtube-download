const ytdl = require('ytdl-core');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const filenamify = require('filenamify');
const { EventEmitter } = require('events');

const File = require('./File');
const YTSource = require('./YTSource');

// https://gist.github.com/sidneys/7095afe4da4ae58694d128b1034e01e2
const ITAG_AUDIO = [
  141, // 256k m4a
  251, // 160k webm
  140, // 128k m4a
  171, // 128k webm
  250, // 70k webm
  249, // 50k webm
  139, // 48k m4a
];
const ITAG_VIDEO = [
  303, // 1080p60 webm
  299, // 1080p60 mp4
  248, // 1080p webm
  169, // 1080p webm
  137, // 1080p mp4
  302, // 720p60 webm
  298, // 720p60 mp4
  247, // 720p webm
  136, // 720p mp4
  246, // 480p webm
  245, // 480p webm
  244, // 480p webm
  218, // 480p webm
  168, // 480p webm
  135, // 480p mp4
  243, // 360p webm
  167, // 360p webm
  134, // 360p mp4
  242, // 240p webm
  133, // 240p mp4
  308, // 1440p60 webm
  278, // 144p webm
  219, // 144p webm
  160, // 144p mp4
  271, // 1440p webm
  264, // 1440p mp4
];

const Status = {
  Init: 'Init',
  GetInfo: 'GetInfo',
  GetInfoComplete: 'GetInfoComplete',
  GetFileStat: 'GetFileStat',
  GetFileStatComplete: 'GetFileStatComplete',
  Download: 'Download',
  DownloadComplete: 'DownloadComplete',
  Encoding: 'Encoding',
  Completed: 'Completed',
  Invalid: 'Invalid',
};

const getExt = (mimeType) => mimeType.replace(/^.+?\/(.+?);[\s\S]*$/, '$1');

class Video extends EventEmitter {
  constructor(props, onStatus) {
    super();
    const { id = '', type = 'audio' } = props;

    this.id = id;
    this.type = type;

    this._status = Status.Init; // eslint-disable-line
    this.onStatus = onStatus;

    setImmediate(() => this.run());
  }

  set status(s) {
    this._status = s; // eslint-disable-line
    this.onStatus();
  }

  get status() {
    return this._status; // eslint-disable-line
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
      case Status.Encoding:
        await this.encode();
        break;
      default:
        return;
    }
    this.run();
  }

  getInfo() {
    this.status = Status.GetInfo;

    return new Promise((resolve, reject) => {
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

        this.title = title;
        this.thumbnail = thumbnail;
        this.lengthSeconds = parseInt(lengthSeconds, 10);

        const fmtMap = adaptiveFormats.reduce(
          (acc, fmt) => ({
            ...acc,
            [fmt.itag]: fmt,
          }),
          {},
        );

        const vidFmt = ITAG_VIDEO.reduce(
          (rs, itag) => rs || fmtMap[itag],
          null,
        );
        const audFmt = ITAG_AUDIO.reduce(
          (rs, itag) => rs || fmtMap[itag],
          null,
        );

        const fileName = filenamify(title, { replacement: '-' });

        const vidSrc = new YTSource({
          id: this.id,
          itag: vidFmt.itag,
          contentLength: parseInt(vidFmt.contentLength, 10),
          file: new File(
            path.resolve(
              Video.path,
              `${fileName}.${this.type}.vid.${getExt(vidFmt.mimeType)}`,
            ),
          ),
        });
        const audSrc = new YTSource({
          id: this.id,
          itag: audFmt.itag,
          contentLength: parseInt(audFmt.contentLength, 10),
          file: new File(
            path.resolve(
              Video.path,
              `${fileName}.${this.type}.aud.${getExt(audFmt.mimeType)}`,
            ),
          ),
        });

        switch (this.type) {
          case 'video':
            this.sources = [vidSrc, audSrc];
            this.target = new File(path.resolve(Video.path, `${fileName}.mp4`));
            break;
          case 'audio':
          default:
            this.sources = [audSrc];
            this.target = new File(path.resolve(Video.path, `${fileName}.mp3`));
        }

        this.status = Status.GetInfoComplete;
        resolve();
      });
    });
  }

  async getFileState() {
    this.status = Status.GetFileStat;
    const targetSize = await this.target.getSize();

    if (targetSize !== -1) {
      await this.clearSources();
      this.progress = 100;
      this.status = Status.Completed;
      return;
    }

    const bytesLoaded = await Promise.all(
      this.sources.map((src) => src.file.getSize()),
    );
    if (
      this.sources.every((src, idx) => bytesLoaded[idx] === src.contentLength)
    ) {
      this.status = Status.DownloadComplete;
      return;
    }

    this.status = Status.GetFileStatComplete;
  }

  async download() {
    this.status = Status.Download;
    const status = this.sources.map(() => ({ loaded: 0, total: 0 }));

    const onProgress = () => {
      const loaded = status.reduce((sum, s) => sum + s.loaded, 0);
      const total = status.reduce((sum, s) => sum + s.total, 0);
      this.progress = parseInt((100 * loaded) / total, 10);
      this.onStatus();
    };
    await Promise.all(
      this.sources.map((src, idx) => {
        const promise = src.download((loaded, total) => {
          status[idx].loaded = loaded;
          status[idx].total = total;
          onProgress();
        });
        return promise;
      }),
    );
    this.status = Status.DownloadComplete;
  }

  encode() {
    this.status = Status.Encoding;
    return new Promise((resolve) => {
      const encoder = ffmpeg();
      this.sources.forEach((src) => {
        encoder.input(src.file.filePath);
      });
      encoder
        .output(this.target.filePath)
        .on('progress', (e) => {
          this.progress = parseInt(Math.min(100, e.percent), 10);
          this.onStatus();
        })
        .on('end', async (err) => {
          if (err) return;
          await this.clearSources();
          this.progress = 100;
          this.status = Status.Completed;
          resolve();
        })
        .run();
    });
  }

  async clearSources() {
    await Promise.all(this.sources.map((s) => s.file.remove()));
  }

  toJSON() {
    const {
      id = '',
      type = 'audio',
      title = '',
      thumbnail = '',
      lengthSeconds = 0,
      progress = 0,
      status = Status.Init,
    } = this;
    return {
      id,
      type,
      title,
      thumbnail,
      lengthSeconds,
      progress,
      status,
    };
  }

  toString() {
    return JSON.stringify(this);
  }
}

Video.path = '';
Video.Status = Status;

module.exports = Video;
