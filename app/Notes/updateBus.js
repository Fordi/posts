const { BrowserWindow, app } = require("electron");
const posts = require("../posts");

const listeners = { $: new Set() };

function on(noteId, fn) {
  if (noteId === '$') return () => {};
  listeners[noteId] = listeners[noteId] || new Set();
  listeners[noteId].add(fn);
  return () => listeners[noteId].delete(fn);
};

function onAll(fn) {
  listeners.$.add(fn);
  return () => listeners.$.delete(fn); 
};


function fire(noteId) {
  if (listeners[noteId]) {
    for (const listener of listeners[noteId]) {
      listener(noteId);
    }
  }
  for (const listener of listeners.$) {
    listener(noteId);
  }
}

onAll(async (noteId) => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('storage', {
      key: `notes.${noteId}`,
      storageArea: null,
    });
  });
  await posts.buildTrayMenu();
});

module.exports = { on, fire, onAll };