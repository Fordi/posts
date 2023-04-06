const { join } = require('path');

const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

const updateNote = require('./updateNote.js');
const { on } = require('./updateBus.js');
const getNote = require('./getNote.js');

const noteWindowProps = {
  minWidth: 180,
  minHeight: 200,
  frame: false, 
  titleBarStyle: 'hidden', 
  resizable: true, 
  alwaysOnTop: false, 
  fullscreenable: false,
  fullscreen: false, 
  skipTaskbar: true,
  title: 'Note',
  icon : join(__dirname, '/icon_color.png'),
  movable: true,
  maximizable: false,
  webPreferences: {
    preload: join(__dirname, '../ipc.js'),
  },
};

const debounce = (fn, timeout = 250) => {
  let handle = null;
  return (...args) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => fn(...args), timeout);
  };
};

module.exports = async function showNote(noteId) {
  await app.whenReady();
  const { width, height, x, y, alwaysOnTop } = (await updateNote({ id: noteId, open: true })) || {};
  const window = new BrowserWindow({ ...noteWindowProps, width, height, x, y });
  window.setMenu(null);
  window.setWindowButtonVisibility(false);
  if (isDev) {
    window.webContents.openDevTools({ mode: 'detach' });
  }
  
  const baseUrl = new URL(
    isDev
    ? 'http://localhost:3000/'
    : `file://${join(__dirname, '../../build/index.html')}`
  );

  baseUrl.searchParams.append('mode', 'note');
  baseUrl.searchParams.append('id', noteId);
  
  window.loadURL(baseUrl.toString());

  const updateNoteLocation = async () => {
    const { width, height, x, y } = window.getBounds();
    return updateNote({ id: noteId, width, height, x, y }, false);
  };

  const unlisten = on(noteId, async () => {
    try {
      const { alwaysOnTop } = (await getNote(noteId)) || {};
      window.setAlwaysOnTop(!!alwaysOnTop);
    } catch (e) {
      return;
    }
  });

  window.on('close', async () => {
    unlisten();
    try {
      await updateNote({ id: noteId, open: false }, false);
    } catch (e) {}
  });

  window.on('move', debounce(updateNoteLocation));

  window.on('resize', debounce(updateNoteLocation));

  window.setAlwaysOnTop(!!alwaysOnTop);
  
  return window;
};


// DE445323