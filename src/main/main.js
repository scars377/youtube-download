const electron = require('electron');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const Video = require('./Video');

const { app, BrowserWindow, ipcMain, shell } = electron;

const dev = process.env.NODE_ENV === 'development';

const storagePath = dev
  ? path.resolve(__dirname, '../../')
  : path.resolve(app.getAppPath(), '../');

const videoPath = path.resolve(storagePath, 'videos');
const urlsPath = path.resolve(storagePath, 'urls.json');

Video.path = videoPath;

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
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile('index.html');
  }

  let list = [];
  let saveQueue = false;
  let saving = false;

  const saveList = () => {
    if (saving) {
      saveQueue = true;
      return;
    }
    saving = true;
    fs.writeFile(urlsPath, JSON.stringify(list, null, 2), 'utf8', () => {
      saving = false;
      if (saveQueue) {
        saveQueue = false;
        saveList();
      }
    });
  };

  const saveAndUpdateList = () => {
    win.webContents.send('update-list', JSON.stringify(list));
    saveList();
  };

  const content = fs.readFileSync(urlsPath, 'utf8');
  try {
    list = JSON.parse(content).map(
      (video) => new Video(video, saveAndUpdateList),
    );
  } catch (err) {
    // nothing
  }

  ipcMain.on('open-videos', () => shell.openItem(videoPath));

  ipcMain.on('update-list', saveAndUpdateList);

  ipcMain.on('clear-completed', async () => {
    list = list.filter((t) => t.status !== Video.Status.Completed);
    saveAndUpdateList();
  });

  ipcMain.on('paste-clipboard', async (event, text) => {
    const idSet = new Set(list.map((t) => t.id));

    const newItems = text
      .split(/[\r\n]+/)
      .map((s) => ytdl.getVideoID(s))
      .filter((s) => typeof s === 'string' && !idSet.has(s))
      .map((id) => new Video({ id }, saveAndUpdateList));

    if (newItems.length === 0) return;

    list = [...newItems, ...list];
    saveAndUpdateList();
  });
});
