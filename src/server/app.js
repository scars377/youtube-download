const electron = require('electron');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const download = require('./lib/download');

const { app, BrowserWindow, ipcMain, shell } = electron;

const dev = process.env.NODE_ENV === 'development';

const videoPath = dev
  ? path.resolve(__dirname, '../../videos')
  : path.resolve(app.getAppPath(), '../videos');

const urlsPath = dev
  ? path.resolve(__dirname, '../../urls.json')
  : path.resolve(app.getAppPath(), '../urls.json');

try {
  fs.statSync(videoPath);
} catch (err) {
  fs.mkdirSync(videoPath);
}
try {
  fs.statSync(urlsPath);
} catch (err) {
  fs.writeFileSync(urlsPath, '[]', 'utf8');
}

app.on('ready', () => {
  const win = new BrowserWindow({
    width: dev ? 1440 : 800,
    height: 800,
    ...(dev
      ? {
        x: 100 - 1680,
        y: 40,
      }
      : {
        center: true,
      }),
  });
  win.setMenu(null);
  if (dev) {
    win.webContents.openDevTools();
    // win.loadURL('http://localhost:8080');
    win.loadFile(path.resolve(__dirname, '../../build/index.html'));
  } else {
    win.loadFile('index.html');
  }
});

ipcMain.on('openVideos', () => {
  shell.openItem(videoPath);
});

ipcMain.on('getURLs', (event) => {
  const urls = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));
  event.sender.send('getURLs', urls);
});

ipcMain.on('setURLs', (event, urls) => {
  fs.writeFile(urlsPath, JSON.stringify(urls), 'utf8', () => {});
});

ipcMain.on('getVideoId', async (event, url) => {
  const id = ytdl.getVideoID(url);
  if (typeof id === 'string') {
    event.sender.send(`getVideoId ${url}`, id);
  } else {
    event.sender.send(`getVideoId ${url}`, null);
  }
});

ipcMain.on('getInfo', async (event, url) => {
  try {
    const info = await ytdl.getBasicInfo(url);
    event.sender.send(`getInfo ${url}`, info);
  } catch (err) {
    event.sender.send(`getInfo ${url}`, null);
  }
});

ipcMain.on('download', async (event, videoId) => {
  download(videoId, videoPath, (progress) => {
    event.sender.send(`download ${videoId}`, progress);
  });
});
