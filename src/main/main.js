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
    width: 800,
    height: 800,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      preload: dev
        ? `${__dirname}/preload.js`
        : path.resolve(app.getAppPath(), '../preload.js'),
    },
  });
  win.setMenu(null);
  if (dev) {
    win.webContents.openDevTools();
    win.loadURL('http://localhost:8080');
  } else {
    win.webContents.openDevTools();
    win.loadFile('index.html');
  }

  let lists = {};
  let saveQueue = false;
  let saving = false;

  const saveLists = () => {
    if (saving) {
      saveQueue = true;
      return;
    }
    saving = true;
    fs.writeFile(urlsPath, JSON.stringify(lists, null, 2), 'utf8', () => {
      saving = false;
      if (saveQueue) {
        saveQueue = false;
        saveLists();
      }
    });
  };

  const saveAndUpdateLists = () => {
    win.webContents.send('update-lists', JSON.stringify(lists));
    saveLists();
  };

  const content = fs.readFileSync(urlsPath, 'utf8');
  try {
    const data = JSON.parse(content);
    lists = {};
    Object.keys(data).forEach((type) => {
      lists[type] = data[type].map(
        (video) => new Video(video, saveAndUpdateLists),
      );
    });
  } catch (err) {
    // nothing
  }

  ipcMain.on('open-videos', () => shell.openPath(videoPath));

  ipcMain.on('update-list', saveAndUpdateLists);

  ipcMain.on('clear-completed', async () => {
    Object.keys(lists).forEach((type) => {
      lists[type] = lists[type].filter(
        (t) => t.status !== Video.Status.Completed,
      );
    });
    saveAndUpdateLists();
  });

  ipcMain.on('paste-clipboard', async (event, [text, type]) => {
    const hasID = (id) => (lists[type] || []).includes(id);

    const newItems = text
      .split(/[\r\n]+/)
      .map((s) => ytdl.getVideoID(s))
      .filter((s) => typeof s === 'string' && !hasID(s))
      .map((id) => new Video({ id, type }, saveAndUpdateLists));

    if (newItems.length === 0) return;
    lists[type] = [...newItems, ...(lists[type] || [])];
    saveAndUpdateLists();
  });
});
