const { BrowserWindow, app } = require('electron');
const newNote = require('./newNote.js');
const showNote = require('./showNote.js');
const storage = require('../storage.js');
const API = require('../API/index.js');
const showOpenNotes = require('./showOpenNotes.js');

module.exports = async function init() {
  API.add('getNote', async (noteId) => {
    const notes = await storage.get('notes');
    if (!notes.length) return null;
    return notes.find(({ id }) => id === noteId);
  });

  API.add('updateNote', async (note) => {
    let notes = await storage.get('notes');
    if (!notes.length) {
      notes = [note];
    } else {
      const index = notes.findIndex(({ id }) => id === note.id);
      notes[index] = { ...notes[index], ...note };
    }
    await storage.set('notes', notes);
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('storage', {
        key: `notes.${note.id}`,
        storageArea: null,
      });
    });
    await app.rebuildTrayMenu();
  });

  API.add('deleteNote', async (noteId) => {
    const notes = await storage.get('notes');
    if (!notes.length) return;
    const note = notes.find(({ id }) => id === noteId);
    if (!note) return;
    await storage.set('notes', notes.filter(n => n !== note));
    await app.rebuildTrayMenu();
  });
  API.add('showOpenNotes', showOpenNotes);
  API.add('newNote', newNote);
  API.add('showNote', showNote);

  const notes = await storage.get('notes');
  if (!notes.length) {
    await newNote();
  } else {
    await Promise.all(notes.map(async note => {
      if (note.open) {
        await showNote(note.id);
      }
    }));
  }
};
