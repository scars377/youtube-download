const electron = require('electron');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const download = require('./lib/download');

const { app, BrowserWindow, ipcMain, shell } = electron;

const dev = process.env.NODE_ENV === 'development';

const videoPath = path.resolve(
  app.getAppPath(),
  dev ? '../../videos' : 'videos',
);

try {
  fs.statSync(videoPath);
} catch (err) {
  fs.mkdirSync(videoPath);
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
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile('index.html');
  }
});

ipcMain.on('openVideos', () => {
  shell.openItem(videoPath);
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
