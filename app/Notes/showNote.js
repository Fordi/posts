const { join } = require('path');

const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

const storage = require('../storage.js');

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

const updateNote = async (noteId, props) => {
  const notes = await storage.get('notes');
  const index = notes.findIndex(note => note.id === noteId);
  if (index === -1) {
    throw new Error(`No note with the id ${noteId}`);
  }
  let changed = false;
  Object.keys(props).forEach((key) => {
    if (notes[index][key] !== props[key]) {
      notes[index][key] = props[key];
      changed = true;
    }
  });
  if (changed) {
    await storage.set('notes', notes);
  }
  return notes[index];
};


const debounce = (fn, timeout = 250) => {
  let handle = null;
  return (...args) => {
    if (handle) {
      clearTimeout(handle);
    }
    handle = setTimeout(() => fn(...args), timeout);
  };
};

module.exports = async function showNote(noteId) {
  await app.whenReady();
  const { width, height, x, y } = await updateNote(noteId, { open: true });
  const window = new BrowserWindow({ ...noteWindowProps, width, height, x, y });
  window.setMenu(null);

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
    return updateNote(noteId, { width, height, x, y });
  };

  window.on('close', async () => {
    await updateNote(noteId, { open: false });
  });
  window.on('move', debounce(updateNoteLocation));
  window.on('resize', debounce(updateNoteLocation));

  return window;
};
